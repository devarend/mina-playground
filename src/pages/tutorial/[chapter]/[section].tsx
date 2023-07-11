import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Header from "@/components/Header";
import { useEffect, useRef, useState } from "react";
import Loader from "@/components/Loader";
import { FileSystemTree, WebContainer } from "@webcontainer/api";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import axios from "axios";
import Tree from "@/components/file-explorer/Tree";
import { getCombinedFiles, getFileContentByPath } from "@/utils/objects";
import tutorials from "@/tutorials.json";
import { getTutorialByChapterAndSection } from "@/utils/tutorial";
import { transformToWebcontainerFiles } from "@/utils/webcontainer";
import { isValidChapterAndSection } from "@/utils/validation";
import { TutorialParams } from "@/types";
import { CH } from "@code-hike/mdx/components";
import CodeEditor from "@/components/editor/CodeEditor";
import TerminalOutput from "@/components/terminal/TerminalOutput";
import TestSection from "@/components/test/TestSection";

const components = { CH };

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          chapter: "01-introduction",
          section: "01-smart-contracts",
        },
      },
      {
        params: {
          chapter: "01-introduction",
          section: "02-private-inputs",
        },
      },
    ],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  IHomeProps,
  TutorialParams
> = async ({ params }) => {
  const { chapter: c, section: s } = params!;
  const isValid = isValidChapterAndSection(c as string, s as string);
  if (!isValid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const { name, test, tutorial, files, focusedFiles, testFiles, highlight } =
    await getTutorialByChapterAndSection(c as string, s as string);

  const webContainerFiles = await transformToWebcontainerFiles(
    `${process.cwd()}/tutorials/${c}/base`
  );

  return {
    props: {
      c,
      s,
      item: {
        tutorial,
        test,
        srcFiles: webContainerFiles,
        focusedFiles,
        highlight,
        testFiles,
        files,
      },
    },
  };
};

const Home: NextPage<IHomeProps> = ({ c, s, item }) => {
  const [tutorialItem, setTutorialItem] = useState(item);
  const {
    tutorial,
    test,
    srcFiles,
    focusedFiles,
    files,
    testFiles,
    highlight,
  } = tutorialItem;

  useEffect(() => {
    const fileCode = getFileContentByPath(highlight, focusedFiles);
    setCode(fileCode);
    setCurrentDirectory(highlight);
    setTerminalOutput(null);
  }, [tutorialItem]);

  const [isInitializing, setIsInitializing] = useState(true);
  const [code, setCode] = useState<string | undefined>("");
  const [isRunning, setIsRunning] = useState(false);
  const [isAborting, setIsAborting] = useState(false);
  const webcontainerInstance = useRef<WebContainer | null>(null);
  const terminalInstance = useRef<any>(null);
  const inputRef = useRef<any>(null);
  const shellRef = useRef<any>(null);
  const [chapter, setChapter] = useState(c);
  const [section, setSection] = useState(s);
  const [currentDirectory, setCurrentDirectory] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<boolean | null>(null);

  const onClick = (code: string, dir: string) => {
    setCodeChange(code, dir);
  };

  const setCodeChange = (code: string | undefined, dir?: string) => {
    if (!code) return;
    setCode(code);
    webcontainerInstance.current?.fs.writeFile(
      `/src/${dir ?? currentDirectory}`.replaceAll(/\*/g, "."),
      code
    );
  };

  const installDependencies = async () => {
    if (!webcontainerInstance.current) return;
    const installProcess = await webcontainerInstance.current.spawn("npm", [
      "install",
    ]);
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      })
    );
    return installProcess.exit;
  };

  const abortTest = async () => {
    setIsAborting(true);
    inputRef.current.write("\u0003");
    setTerminalOutput(null);
  };

  const runTest = async () => {
    setIsRunning(true);
    inputRef.current.write(
      `node --experimental-vm-modules --experimental-wasm-threads node_modules/jest/bin/jest.js ${test} \r`
    );
  };

  const createProcess = async () => {
    if (!webcontainerInstance.current) return;
    const shellProcess = await webcontainerInstance.current.spawn("jsh");

    const input = shellProcess.input.getWriter();

    inputRef.current = input;
    shellRef.current = shellProcess;
    shellRef.current.output.pipeTo(
      new WritableStream({
        write(data) {
          if (data.endsWith("[3G")) {
            setIsRunning(false);
            setIsAborting(false);
          }
          if (data.includes("Tests")) {
            setTerminalOutput(!data.includes("failed"));
          }
        },
      })
    );
    return {
      input,
      shellProcess,
    };
  };

  const requestSection = async (chapter: string, section: string) => {
    try {
      const response = await axios.post(
        "/api/sectionFiles",
        { chapter, section },
        { headers: { "Content-Type": "application/json" } }
      );
      const { files, tutorial, focusedFiles, testFiles, test, highlight } =
        response.data;
      setTutorialItem({
        ...tutorialItem,
        tutorial,
        focusedFiles,
        test,
        highlight,
      });
      const mountFiles = getCombinedFiles(
        srcFiles,
        files,
        focusedFiles,
        testFiles
      );
      await webcontainerInstance.current?.mount(mountFiles);
    } catch (error) {
      console.error(error);
    }
  };

  const startWebContainer = async () => {
    const { WebContainer } = await import("@webcontainer/api");
    if (webcontainerInstance.current) return;
    webcontainerInstance.current = await WebContainer.boot();
    const mountFiles = getCombinedFiles(
      srcFiles,
      files,
      focusedFiles,
      testFiles
    );
    await webcontainerInstance.current.mount(mountFiles);

    const exitCode = await installDependencies();
    if (exitCode !== 0) {
      throw new Error("Installation failed");
    }

    await createProcess();
    setIsInitializing(false);
  };

  const initialize = async () => {
    setIsInitializing(true);
    await startWebContainer();
  };

  useEffect(() => {
    void initialize();
    let keysPressed: Record<string, any> = {};

    const onKeydown = (event: KeyboardEvent) => {
      keysPressed[event.key] = true;

      if (keysPressed["Control"] && event.key == "s") {
        runTest();
      }
    };

    const onKeyup = (event: KeyboardEvent) => {
      delete keysPressed[event.key];
    };

    document.addEventListener("keydown", onKeydown);
    document.addEventListener("keyup", onKeyup);
    return () => {
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("keyup", onKeyup);
    };
  }, []);

  useEffect(() => {
    if (isAborting || !terminalInstance.current) return;
    setTerminalOutput(null);
  }, [isAborting]);

  const onSetSection = (section: string) => {
    setSection(section);
    setCode("");
    setCurrentDirectory("");
    void requestSection(chapter, section);
  };

  return (
    <>
      <Head>
        <title>Mina Playground</title>
        <meta
          name="description"
          content="Interactive Smart Contracts tutorial"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
      </Head>
      <main className={styles.main}>
        <Header />
        <div className="flex flex-1 grid lg:grid-cols-2">
          <div className="bg-[#eee] min-w-0">
            <Breadcrumb
              chapterIndex={chapter}
              sectionIndex={section}
              setChapter={setChapter}
              setSection={onSetSection}
              items={tutorials}
            />
            <div className="px-4 pb-4 lg:h-[calc(100vh-120px)] overflow-y-auto">
              <div id="tutorial">
                <MDXRemote {...tutorial} components={components} />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-1 border-b-2 flex-row">
              <Tree
                data={focusedFiles}
                onBlur={() => null}
                onClick={onClick}
                setCurrentDirectory={setCurrentDirectory}
                currentDirectory={currentDirectory}
              />
              <CodeEditor code={code} setCodeChange={setCodeChange} />
            </div>
            <div>
              <div className="p-2">
                {isInitializing ? (
                  <Loader
                    text="Initializing Smart contract"
                    circleColor={"text-black"}
                    spinnerColor={"fill-orange-500"}
                  />
                ) : (
                  <TestSection
                    isAborting={isAborting}
                    isRunning={isRunning}
                    runTest={runTest}
                    abortTest={abortTest}
                  />
                )}
              </div>
              <TerminalOutput
                isRunning={isRunning}
                terminalOutput={terminalOutput}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

interface IHomeProps {
  c: string;
  s: string;
  item: {
    tutorial: MDXRemoteSerializeResult;
    test: string;
    srcFiles: FileSystemTree;
    focusedFiles: FileSystemTree;
    highlight: string;
    testFiles: FileSystemTree;
    files: FileSystemTree;
  };
}

export default Home;
