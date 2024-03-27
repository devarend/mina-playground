import Head from "next/head";
import Header from "@/components/Header";
import type { NextPage } from "next";
import CodeEditor from "@/components/editor/CodeEditor";
import * as React from "react";
import { useEffect, useState } from "react";
import {
  initializeTerminal,
  installDependencies,
  selectInitializingEsbuild,
  selectWebcontainerInstance,
  selectWebcontainerStarted,
} from "@/features/webcontainer/webcontainerSlice";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import TerminalPreview from "@/features/examples/TerminalPreview";
import { GetServerSideProps } from "next";
import axios from "axios";
import CreateSnippet from "@/features/snippet/CreateSnippet";
import SelectList from "@/components/select/SelectList";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { snippet, type } = query;
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/snippet/${snippet}`
    );
    const { data } = response;
    return {
      props: { data, type },
    };
  } catch {
    return {
      props: { data: null, type: null },
    };
  }
};

type SnippetType = "smart-contract" | "zk-app";

const getTypeData = (type: SnippetType, code: string) => {
  const items = {
    "smart-contract": {
      file: { src: { directory: { "main.ts": { file: { contents: code } } } } },
    },
    "zk-app": {
      file: {
        ui: {
          directory: {
            src: {
              directory: {
                pages: {
                  directory: { "index.tsx": { file: { contents: code } } },
                },
              },
            },
          },
        },
      },
    },
  };
  return items[type];
};

const Home: NextPage<IHomeProps> = ({ data, type }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { snippet } = router.query;
  const webcontainerInstance = useAppSelector(selectWebcontainerInstance);
  const webcontainerStarted = useAppSelector(selectWebcontainerStarted);
  const initializingWebcontainer = useAppSelector(selectInitializingEsbuild);
  const { name, code: snippetCode, type: itemType } = data;
  const [code, setCode] = useState(snippetCode);
  const [snippetType, setSnippetType] = useState<SnippetType>(
    type || "smart-contract"
  );

  const { file } = getTypeData(snippetType, code);

  const mount = async () => {
    if (!webcontainerInstance) return;
    await webcontainerInstance.mount(file);
  };

  useEffect(() => {
    if (!webcontainerStarted) {
      dispatch(installDependencies({ base: snippetType, isExamples: true }));
      return;
    }
  }, [webcontainerStarted]);

  useEffect(() => {
    if (initializingWebcontainer) return;
    dispatch(initializeTerminal({}));
    onCodeChange(code);
  }, [initializingWebcontainer]);

  useEffect(() => {
    if (!webcontainerInstance) return;
    void mount();
  }, [webcontainerInstance]);

  const onCodeChange = (value: string | undefined) => {
    setCode(value || "");
    webcontainerInstance?.fs.writeFile(`src/main.ts`, value || "");
  };

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
            <CreateSnippet code={code} />
            <SelectList
              value={snippetType}
              title={"Choose a type"}
              items={["smart-contract", "zk-app"]}
              onChange={(event) =>
                router.push({
                  pathname: `/snippet/${snippet}`,
                  query: { type: event.target.value },
                })
              }
            />
            <CodeEditor code={code} setCodeChange={onCodeChange} />
          </div>
          <TerminalPreview
            onRunCommand={"npm run build && node build/src/main.js"}
            shouldShowPreview={snippetType === "zk-app"}
          />
        </div>
      </main>
    </>
  );
};

interface IHomeProps {
  data: { name: string; code: string };
  type: SnippetType | undefined;
}

export default Home;
