import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Header from "@/components/Header";
import { GetServerSideProps, NextPage } from "next";
import axios from "axios";
import { FileSystemTree } from "@webcontainer/api";
import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import ProjectFileExplorer from "@/features/project/ProjectFileExplorer";
import RunScriptSection from "@/features/project/RunScriptSection";
import CodeEditorWithSave from "@/features/project/CodeEditorWithSave";
import { initializeWebcontainer } from "@/features/webcontainer/webcontainerSlice";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { projectId } = query;
  try {
    const responseProject = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/project/${projectId}`
    );
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/fileTree/${projectId}`
    );
    const { data } = response;
    return {
      props: { ...responseProject.data, ...data },
    };
  } catch {
    return {
      props: { data: null },
    };
  }
};

const Home: NextPage<HomeProps> = ({ fileSystemTree, name, _id }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeWebcontainer({ fileSystemTree }));
  }, []);

  return (
    <>
      <Head>
        <title>Mina Playground</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Header />
        <div className="flex flex-1 flex-col md:flex-row">
          <div className="p-2 flex-1">
            <h1 className="font-medium text-gray-300">{name}</h1>
            <h1 className="text-xs font-medium text-gray-300">
              Type: Smart Contract
            </h1>
            <hr className="h-px mt-2 mb-4 bg-gray-300 border-0" />
            <ProjectFileExplorer fileSystemTree={fileSystemTree} id={_id} />
          </div>
          <div className="flex flex-col flex-[4]">
            <CodeEditorWithSave id={_id} />
          </div>
        </div>
        <div className="flex flex-col p-2">
          <RunScriptSection fileSystemTree={fileSystemTree} />
          <div className="terminal h-[150px]" />
        </div>
      </main>
    </>
  );
};

interface HomeProps {
  fileSystemTree: FileSystemTree;
  _id: string;
  name: string;
  type: number;
  visibility: boolean;
  files_id: number;
}

export default Home;
