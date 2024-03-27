import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import {
  FileSystemTree,
  WebContainer,
  WebContainerProcess,
} from "@webcontainer/api";

interface WebcontainerState {
  initializingWebcontainer: boolean;
  initializingWebcontainerError: string | null;
  webcontainerStarted: boolean;
  webcontainerInstance: WebContainer | null;
  terminalInitialized: boolean;
  shellProcess: WebContainerProcess | null;
  shellProcessInput: WritableStreamDefaultWriter | null;
  isRemovingFiles: boolean;
  isRunning: boolean;
  isAborting: boolean;
  isTestPassed: boolean | null;
  isDeploying: boolean;
  deploymentMessage: {
    type: "info" | "error";
    message: string;
    details?: string;
  } | null;
  serverUrl: string | null;
  base: string | null;
  privateKey: string | null;
}

const initialState: WebcontainerState = {
  initializingWebcontainer: true,
  initializingWebcontainerError: null,
  webcontainerStarted: false,
  webcontainerInstance: null,
  shellProcessInput: null,
  isRemovingFiles: false,
  isRunning: false,
  isAborting: false,
  isTestPassed: null,
  isDeploying: false,
  deploymentMessage: null,
  serverUrl: null,
  shellProcess: null,
  base: null,
  terminalInitialized: false,
  privateKey: null,
};

const jshRC: string = `
export PNPM_HOME="/home/.pnpm"
export PATH="/bin:/usr/bin:/usr/local/bin:/home/.pnpm"
alias git='npx -y --package=g4c@stable -- g4c'
alias ni='npx -y --package=@antfu/ni -- ni'
`;

export const installDependencies = createAsyncThunk(
  "installDependencies",
  async (
    {
      base,
      fileSystemTree,
      isExamples = false,
      hasPackageJSON = true,
    }: {
      base?: string;
      fileSystemTree?: FileSystemTree;
      isExamples?: boolean;
      hasPackageJSON?: boolean;
    },
    { dispatch, getState, rejectWithValue }
  ) => {
    const { WebContainer } = await import("@webcontainer/api");
    const webcontainer = await WebContainer.boot({
      workdirName: "mina",
    });
    dispatch(setWebcontainerInstance(webcontainer));
    // await webcontainer.fs.writeFile(".jshrc", jshRC);
    // await webcontainer.spawn("mv", [".jshrc", "/home/.jshrc"]);

    const baseFiles = fileSystemTree
      ? fileSystemTree
      : isExamples
      ? (await import(`@/examples-json/${base}-base.json`)).default
      : (await import(`@/json/${base}-base.json`)).default;
    await webcontainer.mount(baseFiles);

    // const watcher = await webcontainer.spawn("npx", [
    //   "-y",
    //   "chokidar-cli",
    //   ".",
    //   "-i",
    //   '"**/(node_modules|.git|_tmp_)"',
    // ]);
    // watcher.output.pipeTo(
    //   new WritableStream({
    //     async write(data) {
    //       const [type, name] = data.split(":");
    //       switch (type) {
    //         case "change":
    //           break;
    //         case "add":
    //         case "addDir":
    //         case "unlink":
    //         case "unlinkDir":
    //         default:
    //           console.log(name);
    //       }
    //     },
    //   })
    // );

    webcontainer.on("server-ready", (port, url) => {
      dispatch(setServerUrl(url));
    });

    if (hasPackageJSON) {
      const installProcess = await webcontainer.spawn("npm", ["install"]);
      if ((await installProcess.exit) !== 0) {
        throw new Error("Installation failed");
      }
    }

    return { webcontainer };
  }
);

export const writeCommand = createAsyncThunk(
  "writeCommand",
  async (command: string, { getState, dispatch }) => {
    dispatch(setIsRunning(true));
    const { webcontainer } = getState() as { webcontainer: WebcontainerState };
    await webcontainer.shellProcessInput?.write(command);
  }
);

export const removeFiles = createAsyncThunk(
  "removeFiles",
  async (files: string[], { getState, dispatch }) => {
    const { webcontainer } = getState() as { webcontainer: WebcontainerState };
    await Promise.all(
      files.map(async (item) => {
        // @ts-ignore
        return await webcontainer.webcontainerInstance.fs.rm(item, {
          force: true,
        });
      })
    );
  }
);

export const stop = createAsyncThunk(
  "stop",
  async (_: void, { getState, dispatch }) => {
    dispatch(setIsRunning(true));
    const { webcontainer } = getState() as { webcontainer: WebcontainerState };
    // webcontainer.shellProcess.kill();
    // await webcontainer.shellProcess.exit;
    webcontainer.webcontainerInstance?.teardown();
  }
);

export const initializeTerminal = createAsyncThunk(
  "initTerminal",
  async (
    {
      installDirectories = [],
    }: { installDirectories?: { directory: string; build: boolean }[] | [] },
    { getState, dispatch }
  ) => {
    const { webcontainer } = getState() as {
      webcontainer: WebcontainerState;
    };
    const { FitAddon } = await import("xterm-addon-fit");
    const fitAddon = new FitAddon();
    const { Terminal } = await import("xterm");
    const terminalEl = document.querySelector(".terminal");
    const terminal = new Terminal({
      convertEol: true,
    });
    terminal.loadAddon(fitAddon);
    terminal.open(<HTMLElement>terminalEl);
    fitAddon.fit();

    // if (webcontainer.shellProcess) {
    //   webcontainer.shellProcess.kill();
    //   await webcontainer.shellProcess.exit;
    // }

    // @ts-ignore
    const shellProcess = await webcontainer.webcontainerInstance.spawn("jsh", {
      terminal: {
        cols: terminal.cols,
        rows: terminal.rows,
      },
    });
    dispatch(setShellProcess(shellProcess));

    const xtermResizeOb = new ResizeObserver(function (entries) {
      fitAddon.fit();
      shellProcess.resize({
        cols: terminal.cols,
        rows: terminal.rows,
      });
    });

    xtermResizeOb.observe(<HTMLElement>terminalEl);

    const input = shellProcess.input.getWriter();
    terminal.onData((data) => {
      input.write(data);
    });

    shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data);
          if (data === "^C") {
            dispatch(setIsAborting(true));
          }
          if (data.endsWith("[3G")) {
            dispatch(setTerminalInitialized(true));
            dispatch(setIsRunning(false));
            dispatch(setIsAborting(false));
          }
        },
      })
    );
    return { input };
  }
);

export const initializeShellProcess = createAsyncThunk(
  "initShellProcess",
  async (_: void, { getState, dispatch }) => {
    const { webcontainer } = getState() as { webcontainer: WebcontainerState };

    // @ts-ignore
    const shellProcess = await webcontainer.webcontainerInstance.spawn("jsh");
    const input = shellProcess.input.getWriter();

    shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          if (data === "^C") {
            dispatch(setIsAborting(true));
          }
          if (data.endsWith("[3G")) {
            dispatch(setIsRunning(false));
            dispatch(setIsAborting(false));
          }
          if (data.includes("Tests")) {
            dispatch(setIsTestPassed(!data.includes("failed")));
          }
        },
      })
    );

    return { input };
  }
);

export const deploySmartContract = createAsyncThunk(
  "deploySmartContract",
  async (
    { path, feePayerKey }: { path: string; feePayerKey?: string },
    { getState, dispatch }
  ) => {
    dispatch(setIsDeploying(true));
    dispatch(setDeploymentMessage(null));
    const { webcontainer } = getState() as { webcontainer: WebcontainerState };
    const process = await webcontainer?.webcontainerInstance?.spawn("npm", [
      "run",
      "build",
    ]);
    await process?.exit;

    const process2 = await webcontainer?.webcontainerInstance?.spawn("npx", [
      "--yes",
      "easy-mina-deploy",
      "deploy",
      "--path",
      path,
      "--className",
      "Add",
      "--feePayerKey",
      feePayerKey || (webcontainer.privateKey as string),
    ]);

    process2?.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
          if (data.startsWith("{")) {
            dispatch(setDeploymentMessage(JSON.parse(data)));
          }
        },
      })
    );

    await process2?.exit;
    dispatch(setIsDeploying(false));
  }
);

export const webcontainerSlice = createSlice({
  name: "webcontainer",
  initialState,
  reducers: {
    reset: (state) => {
      /* keep webcontainer state since we are re-using the current webcontainer process */
      const webContainerState = {
        // webcontainerInstance: state.webcontainerInstance,
        webcontainerStarted: state.webcontainerStarted,
        initializingWebcontainer: state.initializingWebcontainer,
        initializingWebcontainerError: state.initializingWebcontainerError,
        shellProcess: state.shellProcess,
      };

      return {
        ...initialState,
        ...webContainerState,
      };
    },
    setIsRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
    },
    setIsAborting: (state, action: PayloadAction<boolean>) => {
      state.isAborting = action.payload;
    },
    setIsTestPassed: (state, action: PayloadAction<boolean | null>) => {
      state.isTestPassed = action.payload;
    },
    setIsDeploying: (state, action: PayloadAction<boolean>) => {
      state.isDeploying = action.payload;
    },
    setDeploymentMessage: (state, action: PayloadAction<any>) => {
      state.deploymentMessage = action.payload;
    },
    setServerUrl: (state, action: PayloadAction<any>) => {
      state.serverUrl = action.payload;
    },
    setWebcontainerInstance: (state, action: PayloadAction<any>) => {
      state.webcontainerInstance = action.payload;
    },
    setShellProcess: (state, action: PayloadAction<any>) => {
      state.shellProcess = action.payload;
    },
    setWebcontainerStarted: (state, action: PayloadAction<any>) => {
      state.webcontainerInstance = action.payload;
    },
    setTerminalInitialized: (state, action: PayloadAction<boolean>) => {
      state.terminalInitialized = action.payload;
    },
    setPrivateKey: (state, action: PayloadAction<string>) => {
      state.privateKey = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(installDependencies.pending, (state, action) => {
        state.webcontainerStarted = true;
        state.initializingWebcontainerError = null;
        state.initializingWebcontainer = true;
      })
      .addCase(installDependencies.fulfilled, (state, action) => {
        state.initializingWebcontainer = false;
        console.log("fulfiled");
      })
      .addCase(installDependencies.rejected, (state, action) => {
        if (action.payload) return;
        state.initializingWebcontainerError =
          action.error.message ?? "An unexpected error has occurred";
      })
      .addCase(initializeTerminal.fulfilled, (state, action) => {
        state.shellProcessInput = action.payload.input;
      })
      .addCase(initializeShellProcess.fulfilled, (state, action) => {
        state.shellProcessInput = action.payload.input;
      })
      .addCase(removeFiles.pending, (state, action) => {
        state.isRemovingFiles = true;
      })
      .addCase(removeFiles.fulfilled, (state, action) => {
        state.isRemovingFiles = false;
      });
    //TODO add reject case for write command
  },
});

export const selectInitializingEsbuild = (state: RootState) =>
  state.webcontainer.initializingWebcontainer;

export const selectInitializingWebContainerError = (state: RootState) =>
  state.webcontainer.initializingWebcontainerError;

export const selectWebcontainerInstance = (state: RootState) =>
  state.webcontainer.webcontainerInstance;

export const selectWebcontainerStarted = (state: RootState) =>
  state.webcontainer.webcontainerStarted;

export const selectIsRemovingFiles = (state: RootState) =>
  state.webcontainer.isRemovingFiles;

export const selectIsRunning = (state: RootState) =>
  state.webcontainer.isRunning;

export const selectIsAborting = (state: RootState) =>
  state.webcontainer.isAborting;

export const selectIsTestPassed = (state: RootState) =>
  state.webcontainer.isTestPassed;

export const selectIsDeploying = (state: RootState) =>
  state.webcontainer.isDeploying;

export const selectDeploymentMessage = (state: RootState) =>
  state.webcontainer.deploymentMessage;

export const selectServerUrl = (state: RootState) =>
  state.webcontainer.serverUrl;

export const selectTerminalInitialized = (state: RootState) =>
  state.webcontainer.terminalInitialized;

export const {
  setIsRunning,
  setIsAborting,
  setIsDeploying,
  setDeploymentMessage,
  setIsTestPassed,
  setWebcontainerInstance,
  setShellProcess,
  setServerUrl,
  reset,
  setTerminalInitialized,
  setPrivateKey,
} = webcontainerSlice.actions;
export default webcontainerSlice.reducer;
