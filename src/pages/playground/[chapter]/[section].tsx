import Head from "next/head";
import Header from "@/components/Header";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { TutorialParams, TutorialResponse } from "@/types";
import CodeEditor from "@/components/editor/CodeEditor";
import * as React from "react";
import { useEffect, useState } from "react";
import {
  initializeTerminal,
  installDependencies,
  removeFiles,
  selectInitializingEsbuild,
  selectIsRemovingFiles,
  selectTerminalInitialized,
  selectWebcontainerInstance,
  selectWebcontainerStarted,
  writeCommand,
} from "@/features/webcontainer/webcontainerSlice";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import examplesPath from "@/examplePaths.json";
import examples from "@/examples.json";
import { normalizePath } from "@/utils/fileSystemWeb";
import { constructInstallCommand } from "@/utils/jsh";
import { mapTypeToCustomComponent } from "@/mappers/mapTypeToCustomComponent";
import TerminalPreview from "@/features/examples/TerminalPreview";

export const getStaticPaths: GetStaticPaths = async () => {
  return examplesPath;
};

export const getStaticProps: GetStaticProps<
  IHomeProps,
  TutorialParams
> = async ({ params }) => {
  const { chapter: c, section: s } = params!;

  const tutorialResponse: TutorialResponse = (
    await import(`../../../examples-json/${c}-${s}.json`)
  ).default;

  return {
    props: {
      c,
      s,
      item: tutorialResponse,
    },
  };
};

const Home: NextPage<IHomeProps> = ({ c, s, item }) => {
  const dispatch = useAppDispatch();
  const webcontainerInstance = useAppSelector(selectWebcontainerInstance);
  const webcontainerStarted = useAppSelector(selectWebcontainerStarted);
  const initializingWebcontainer = useAppSelector(selectInitializingEsbuild);
  const isRemovingFiles = useAppSelector(selectIsRemovingFiles);
  const terminalInitialized = useAppSelector(selectTerminalInitialized);

  const {
    files,
    filesArray,
    focusedFiles,
    highlightedItem,
    base,
    command,
    type,
    initTerminal,
  } = item;

  const [currentFile, setCurrentFile] = useState(highlightedItem);
  const Component = mapTypeToCustomComponent(type, currentFile.highlightedCode);

  const iszkApp = type === "playground-zkApp";
  const hasPackageJSON = !iszkApp;
  const installDirectories = iszkApp
    ? [
        { directory: "contracts", build: true },
        { directory: "ui", build: false },
      ]
    : [];

  const remove = async () => {
    if (!webcontainerInstance) return;
    dispatch(removeFiles(filesArray));
  };

  const mount = async () => {
    if (!webcontainerInstance) return;
    await webcontainerInstance.mount(files);
  };

  useEffect(() => {
    if (!webcontainerStarted) {
      dispatch(
        installDependencies({
          base: base as string,
          isExamples: true,
          hasPackageJSON,
        })
      );
      return;
    }
  }, [webcontainerStarted]);

  useEffect(() => {
    if (initializingWebcontainer) return;
    if (initTerminal) {
      dispatch(initializeTerminal({ installDirectories }));
    }
    // apply changed code after WebContainer has been initialized
    onCodeChange(currentFile.highlightedCode);
    webcontainerInstance?.fs.writeFile(
      filesArray[0],
      currentFile.highlightedCode
    );
  }, [initializingWebcontainer]);

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

  const onCodeChange = (value: string | undefined) => {
    const code = value || "";
    setCurrentFile({
      ...currentFile,
      highlightedCode: code,
    });
  };

  const onBlur = (value: string | undefined) => {
    webcontainerInstance?.fs.writeFile(filesArray[0], value || "");
  };

  useEffect(() => {
    if (!terminalInitialized || !installDirectories.length) return;
    dispatch(writeCommand(`${constructInstallCommand(installDirectories)} \r`));
  }, [terminalInitialized]);

  return (
    <>
      <Head>
        <title>Mina Playground</title>
        <meta name="description" content="Interactive tutorials" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
      </Head>
      <main>
        <Header />
        <div className="flex flex-1 grid lg:grid-cols-2">
          <div className="flex flex-col">
            <Breadcrumb
              chapterIndex={c}
              sectionIndex={s}
              items={examples}
              isExamples={true}
            />
            <div className="flex bg-gray-700 mb-2 rounded-lg mx-4 mt-2">
              {Object.entries(focusedFiles).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() =>
                    setCurrentFile({
                      highlightedName: key,
                      highlightedCode: value.file.contents,
                    })
                  }
                  className={`btn-sm text-white hover:btn-secondary ${
                    currentFile.highlightedName === key && "btn-primary"
                  }`}
                >
                  {normalizePath(key)}
                </button>
              ))}
            </div>
            <CodeEditor
              code={currentFile.highlightedCode}
              setCodeChange={onCodeChange}
              onBlur={onBlur}
            />
          </div>
          {initTerminal && (
            <TerminalPreview
              onRunCommand={command}
              shouldShowPreview={iszkApp}
            />
          )}
          {Component}
        </div>
      </main>
    </>
  );
};

interface IHomeProps {
  c: string;
  s: string;
  item: TutorialResponse;
}

export default Home;
