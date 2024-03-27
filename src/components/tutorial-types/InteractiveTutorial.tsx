import { FC, useEffect, useState } from "react";
import Tree from "@/components/file-explorer/Tree";
import CodeEditor from "@/components/editor/CodeEditor";
import RunScriptButton from "@/components/terminal/RunScriptButton";
import TerminalOutput from "@/components/terminal/TerminalOutput";
import {
  initializeShellProcess,
  initializeTerminal,
  installDependencies,
  removeFiles,
  reset,
  selectInitializingEsbuild,
  selectIsRemovingFiles,
  selectWebcontainerInstance,
  selectWebcontainerStarted,
  setIsTestPassed,
  writeCommand,
} from "@/features/webcontainer/webcontainerSlice";
import {
  selectCurrentDirectory,
  setChangedFields,
  setCurrentTreeItem,
} from "@/features/fileTree/fileTreeSlice";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { FileSystemTree } from "@webcontainer/api";
import * as React from "react";
import WebcontainerLoader from "@/features/webcontainer/WebcontainerLoader";
import { useRouter } from "next/router";
import { event } from "nextjs-google-analytics";
import { ItemType } from "@/types";
import { mapTypeToCustomComponent } from "@/mappers/mapTypeToCustomComponent";

const InteractiveTutorial: FC<InteractiveTutorialProps> = ({
  type,
  files,
  filesArray,
  focusedFiles,
  highlightedItem,
  base,
  initTerminal,
}) => {
  const { highlightedName, highlightedCode } = highlightedItem;
  const [code, setCode] = useState<string | undefined>(highlightedCode);
  const webcontainerInstance = useAppSelector(selectWebcontainerInstance);
  const webcontainerStarted = useAppSelector(selectWebcontainerStarted);
  const initializingWebcontainer = useAppSelector(selectInitializingEsbuild);
  const isRemovingFiles = useAppSelector(selectIsRemovingFiles);

  const router = useRouter();
  const { chapter, section } = router.query;

  const currentDirectory = useAppSelector(selectCurrentDirectory);
  const dispatch = useAppDispatch();

  const resetTerminalOutput = () => dispatch(setIsTestPassed(null));

  useEffect(() => {
    dispatch(setCurrentTreeItem(highlightedName));
  }, []);

  // TODO create webcontainer hook
  useEffect(() => {
    if (!webcontainerStarted) {
      dispatch(installDependencies({ base }));
      return;
    }
  }, [webcontainerStarted]);

  const remove = async () => {
    if (!webcontainerInstance) return;
    dispatch(removeFiles(filesArray));
  };

  const mount = async () => {
    if (!webcontainerInstance) return;
    await webcontainerInstance.mount(files);
  };

  useEffect(() => {
    if (!webcontainerInstance) return;
    return () => {
      void remove();
    };
  }, [webcontainerInstance]);

  useEffect(() => {
    if (!webcontainerInstance || isRemovingFiles) return;
    void mount();
  }, [webcontainerInstance, isRemovingFiles]);

  useEffect(() => {
    if (initializingWebcontainer) return;
    if (initTerminal) {
      dispatch(initializeTerminal({}));
    }
  }, [initializingWebcontainer]);

  const onClick = (code: string) => {
    setCode(code);
  };

  const onCodeChange = (value: string | undefined) => {
    const code = value || "";
    setCode(code);
    webcontainerInstance?.fs.writeFile(
      `/src/${currentDirectory}`.replace(/\*/g, "."),
      code
    );
  };

  const abortTest = async () => {
    dispatch(writeCommand("\u0003"));
    resetTerminalOutput();
  };

  const runTest = async () => {
    event("run_tutorial", {
      category: "Interactive tutorials",
      label: `${chapter}-${section}`,
    });
    dispatch(writeCommand("npm run build && node build/src/main.js \r"));
  };

  return (
    <>
      <div className="flex flex-1 border-b-2 flex-row">
        {initializingWebcontainer ? (
          <div className="flex flex-1 justify-center m-2">
            <WebcontainerLoader />
          </div>
        ) : (
          <>
            <div className="w-40 p-4">
              <Tree
                data={focusedFiles}
                onClick={onClick}
                enableActions={false}
              />
            </div>
            <CodeEditor code={code} setCodeChange={onCodeChange} />
          </>
        )}
      </div>
      <div>
        {initTerminal && (
          <>
            <div className="p-2">
              <RunScriptButton
                onRun={runTest}
                abortTitle={"Abort"}
                onAbort={abortTest}
                runTitle={"Run"}
              />
            </div>
            <div className="terminal h-[150px] md:h-[180px] max-w-[100vw] bg-black" />
          </>
        )}
        {mapTypeToCustomComponent(type, code)}
      </div>
    </>
  );
};

interface InteractiveTutorialProps {
  type: ItemType;
  filesArray: string[];
  highlightedItem: {
    highlightedName: string;
    highlightedCode: string;
  };
  files: FileSystemTree;
  focusedFiles: FileSystemTree;
  base: string;
  initTerminal: boolean;
}

export default InteractiveTutorial;
