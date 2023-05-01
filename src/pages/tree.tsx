import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Tree from "@/components/file-explorer/Tree";
import type {
  DirectoryNode,
  FileNode,
  FileSystemTree,
} from "@webcontainer/api";
import { useState } from "react";
import { produce } from "immer";
import { get } from "lodash";
import { FileSystemType } from "@/types";

const data: FileSystemTree = {
  src: {
    directory: {
      "main.js": {
        file: {
          contents: `
            console.log('Hello')
          `,
        },
      },
      "main2.js": {
        file: {
          contents: `
            console.log('Hello')
          `,
        },
      },
    },
  },
  test: {
    directory: {
      "main2.js": {
        file: {
          contents: `
            console.log('Hello')
          `,
        },
      },
    },
  },
  testok: {
    directory: {
      testok2: {
        directory: {
          testok2: {
            directory: {
              "main2.js": {
                file: {
                  contents: `
            console.log('Hello')
          `,
                },
              },
            },
          },
        },
      },
    },
  },
};

const Home = () => {
  const [fileData, setFileData] = useState(data);
  const [currentDirectory, setCurrentDirectory] = useState<string>("");

  const immutable = (
    callback: (
      data: FileSystemTree | (DirectoryNode | FileNode),
      hasDirectory: boolean
    ) => void
  ) => {
    return produce((fileData: FileSystemTree) => {
      const data = get(fileData, currentDirectory);
      callback(currentDirectory ? data : fileData, !!currentDirectory);
    });
  };

  const createNewFile = () => {
    const newFile = {
      file: {
        contents: "",
      },
    };

    setFileData(
      immutable((fileData, hasDirectory) => {
        if (!hasDirectory) {
          (fileData as FileSystemTree)[""] = newFile;
          return;
        }
        const newFileData = fileData as DirectoryNode;
        newFileData.directory = {
          ...newFileData.directory,
          "": newFile,
        };
      })
    );
  };

  const createNewFolder = () => {
    const newFolder = {
      directory: {},
    };

    setFileData(
      immutable((fileData, hasDirectory) => {
        if (!hasDirectory) {
          (fileData as FileSystemTree)[""] = newFolder;
          return;
        }
        const newFileData = fileData as DirectoryNode;
        newFileData.directory = {
          ...newFileData.directory,
          "": newFolder,
        };
      })
    );
  };

  const onBlur = (value: string, type: FileSystemType) => {
    const newFolder = {
      directory: {},
    };

    const newFile = {
      file: {
        contents: "",
      },
    };

    const newValue = type === "directory" ? newFolder : newFile;

    setFileData(
      immutable((fileData, hasDirectory) => {
        if (value) {
          if (!hasDirectory) {
            (fileData as FileSystemTree)[value] = newValue;
          } else {
            const newFileData = fileData as DirectoryNode;
            newFileData.directory = {
              ...newFileData.directory,
              [value]: newValue,
            };
          }
        }
        if (!hasDirectory) {
          delete (fileData as FileSystemTree)[""];
        } else {
          delete (fileData as DirectoryNode).directory[""];
        }
      })
    );
  };

  return (
    <>
      <Head>
        <title>Playground</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={"m-4"}>
          <div className="flex flex-row gap-1 mb-6">
            <svg
              onClick={createNewFile}
              height={16}
              width={16}
              className="cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
            >
              <path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384v38.6C310.1 219.5 256 287.4 256 368c0 59.1 29.1 111.3 73.7 143.3c-3.2 .5-6.4 .7-9.7 .7H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zm48 96a144 144 0 1 1 0 288 144 144 0 1 1 0-288zm16 80c0-8.8-7.2-16-16-16s-16 7.2-16 16v48H368c-8.8 0-16 7.2-16 16s7.2 16 16 16h48v48c0 8.8 7.2 16 16 16s16-7.2 16-16V384h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H448V304z" />
            </svg>
            <svg
              onClick={createNewFolder}
              height={16}
              width={16}
              className="cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path d="M512 416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H192c20.1 0 39.1 9.5 51.2 25.6l19.2 25.6c6 8.1 15.5 12.8 25.6 12.8H448c35.3 0 64 28.7 64 64V416zM232 376c0 13.3 10.7 24 24 24s24-10.7 24-24V312h64c13.3 0 24-10.7 24-24s-10.7-24-24-24H280V200c0-13.3-10.7-24-24-24s-24 10.7-24 24v64H168c-13.3 0-24 10.7-24 24s10.7 24 24 24h64v64z" />
            </svg>
          </div>
          <Tree
            data={fileData}
            onBlur={onBlur}
            setCurrentDirectory={setCurrentDirectory}
            currentDirectory={currentDirectory}
          />
        </div>
      </main>
    </>
  );
};

export default Home;
