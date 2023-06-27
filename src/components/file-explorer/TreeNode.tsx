import { FC, useState } from "react";
import Tree from "@/components/file-explorer/Tree";
import { DirectoryNode, FileNode } from "@webcontainer/api";
import { FileSystemType } from "@/types";

const DirectoryIcon = () => (
  <svg
    height={12}
    width={12}
    className={"mr-1"}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z" />
  </svg>
);

const FileIcon = () => (
  <svg
    height={12}
    width={12}
    className="mr-1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
  >
    <path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z" />
  </svg>
);

const TreeNode: FC<TreeNodeProps> = ({
  node,
  onBlur,
  onClick,
  setCurrentDirectory,
  directory,
  currentDirectory,
}) => {
  const [key, value] = node;
  const dir = directory.path ? `${directory.path}/${key}` : `${key}`;
  const [inputValue, setInputValue] = useState("");
  const [showChildren, setShowChildren] = useState(
    currentDirectory.path.startsWith(dir)
  );
  const isDirectory = "directory" in value;
  const isSelected = currentDirectory && dir === currentDirectory.path;
  const isSelectedStyle = isSelected ? "bg-blue-100" : "";

  const webcontainer = isDirectory
    ? `${key}.directory`
    : `${key}.file.contents`;
  const webcontainerPath = directory.webcontainerPath
    ? `${directory.webcontainerPath}.${webcontainer}`
    : webcontainer;
  const handleClick = () => {
    setCurrentDirectory({ path: dir, webcontainerPath });
    if (!isDirectory) {
      const code = (value as FileNode).file.contents;
      onClick(code as string, dir);
    }
    setShowChildren(!showChildren);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`group new-file flex p-2 gap-1 flex-row items-center mb-2 cursor-pointer ${isSelectedStyle}`}
      >
        <div className="flex flex-1 flex-row items-center">
          {isDirectory ? (
            showChildren ? (
              <span className="text-sm">▼</span>
            ) : (
              <span className="text-sm">►</span>
            )
          ) : null}
          {isDirectory ? <DirectoryIcon /> : <FileIcon />}
          {key === "" ? (
            <input
              autoFocus
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onBlur={() =>
                onBlur(inputValue, isDirectory ? "directory" : "file")
              }
              className="pl-2 border border-gray-300 rounded-md bg-gray-50"
            />
          ) : (
            <span>{key.replace(/\*/g, ".")}</span>
          )}
        </div>
        <div className="hidden group-hover:block">
          <svg
            onClick={(event) => {
              event.stopPropagation();
              console.log(webcontainerPath);
            }}
            height={16}
            width={16}
            className="cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
          >
            <path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384v38.6C310.1 219.5 256 287.4 256 368c0 59.1 29.1 111.3 73.7 143.3c-3.2 .5-6.4 .7-9.7 .7H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zm48 96a144 144 0 1 1 0 288 144 144 0 1 1 0-288zm16 80c0-8.8-7.2-16-16-16s-16 7.2-16 16v48H368c-8.8 0-16 7.2-16 16s7.2 16 16 16h48v48c0 8.8 7.2 16 16 16s16-7.2 16-16V384h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H448V304z" />
          </svg>
        </div>
      </div>
      {isDirectory && (
        <ul className="pl-2">
          {showChildren && (
            <Tree
              data={value.directory}
              onBlur={onBlur}
              onClick={onClick}
              directory={{ path: dir, webcontainerPath }}
              currentDirectory={currentDirectory}
              setCurrentDirectory={setCurrentDirectory}
            />
          )}
        </ul>
      )}
    </>
  );
};

interface TreeNodeProps {
  node: [string, DirectoryNode | FileNode];
  onBlur(value: string, type: FileSystemType): void;
  onClick(code: string, dir: string): void;
  setCurrentDirectory(directory: {
    path: string;
    webcontainerPath: string;
  }): void;
  directory: { path: string; webcontainerPath: string };
  currentDirectory: { path: string; webcontainerPath: string };
}

export default TreeNode;
