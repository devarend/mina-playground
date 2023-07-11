import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { FileSystemTree, WebContainer } from "@webcontainer/api";

interface WebcontainerState {
  initializingWebcontainer: boolean;
  initializingWebcontainerError: boolean;
  webcontainerInstance: WebContainer | null;
  shellProcessInput: WritableStreamDefaultWriter | null;
  isRunning: boolean;
  isAborting: boolean;
}

const initialState: WebcontainerState = {
  initializingWebcontainer: false,
  initializingWebcontainerError: false,
  webcontainerInstance: null,
  shellProcessInput: null,
  isRunning: false,
  isAborting: false,
};

export const initializeWebcontainer = createAsyncThunk(
  "initializeWebcontainer",
  async (
    { fileSystemTree }: { fileSystemTree: FileSystemTree },
    { dispatch }
  ) => {
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

    const { WebContainer } = await import("@webcontainer/api");
    const webcontainer = await WebContainer.boot();
    await webcontainer.mount(fileSystemTree);

    const installProcess = await webcontainer.spawn("npm", ["install"]);
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          // terminal.write(data);
        },
      })
    );

    if ((await installProcess.exit) !== 0) {
      throw new Error("Installation failed");
    }

    const shellProcess = await webcontainer.spawn("jsh", {
      terminal: {
        cols: terminal.cols,
        rows: terminal.rows,
      },
    });

    // window.addEventListener("resize", () => {
    //   fitAddon.fit();
    //   shellProcess.resize({
    //     cols: terminal.cols,
    //     rows: terminal.rows,
    //   });
    // });

    const xterm_resize_ob = new ResizeObserver(function (entries) {
      fitAddon.fit();
      shellProcess.resize({
        cols: terminal.cols,
        rows: terminal.rows,
      });
    });
    xterm_resize_ob.observe(<HTMLElement>terminalEl);

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
            dispatch(setIsRunning(false));
            dispatch(setIsAborting(false));
          }
          if (data.includes("Tests")) {
            // setTerminalOutput(!data.includes("failed"));
          }
        },
      })
    );

    return { webcontainer, input };
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

export const webcontainerSlice = createSlice({
  name: "webcontainer",
  initialState,
  reducers: {
    setIsRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
    },
    setIsAborting: (state, action: PayloadAction<boolean>) => {
      state.isAborting = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(initializeWebcontainer.pending, (state, action) => {
        state.initializingWebcontainer = true;
      })
      .addCase(initializeWebcontainer.fulfilled, (state, action) => {
        state.initializingWebcontainer = false;
        state.webcontainerInstance = action.payload.webcontainer;
        state.shellProcessInput = action.payload.input;
      })
      .addCase(initializeWebcontainer.rejected, (state, action) => {
        state.initializingWebcontainer = false;
        state.initializingWebcontainerError = true;
      });
    //TODO add reject case for write command
  },
});

export const selectInitializingEsbuild = (state: RootState) =>
  state.webcontainer.initializingWebcontainer;

export const selectWebcontainerInstance = (state: RootState) =>
  state.webcontainer.webcontainerInstance;

export const selectIsRunning = (state: RootState) =>
  state.webcontainer.isRunning;

export const selectIsAborting = (state: RootState) =>
  state.webcontainer.isAborting;

export const { setIsRunning, setIsAborting } = webcontainerSlice.actions;
export default webcontainerSlice.reducer;
