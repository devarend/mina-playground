import { FC } from "react";
import TreeNode from "@/components/file-explorer/TreeNode";
import type { FileSystemTree } from "@webcontainer/api";
import { FileSystemAction, FileSystemType } from "@/types";

const Tree: FC<TreeProps> = ({
  data,
  onBlur,
  onChange,
  onClick,
  setCurrentDirectory,
  directory = { path: "", webcontainerPath: "" },
  currentDirectory,
}) => {
  return (
    <ul>
      {Object.entries(data).map((node, index) => (
        <TreeNode
          node={node}
          key={index}
          onBlur={onBlur}
          onChange={onChange}
          onClick={onClick}
          directory={directory}
          currentDirectory={currentDirectory}
          setCurrentDirectory={setCurrentDirectory}
        />
      ))}
    </ul>
  );
};

interface TreeProps {
  data: FileSystemTree;
  onBlur(value: string, type: FileSystemType, path: string): void;
  onChange(action: FileSystemAction, type: FileSystemType, path: string): void;
  onClick(code: string, dir: string): void;
  setCurrentDirectory(directory: {
    path: string;
    webcontainerPath: string;
  }): void;
  directory?: { path: string; webcontainerPath: string };
  currentDirectory: { path: string; webcontainerPath: string };
}

export default Tree;
