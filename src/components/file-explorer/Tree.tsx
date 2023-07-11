import { FC } from "react";
import TreeNode from "@/components/file-explorer/TreeNode";
import type { FileSystemTree } from "@webcontainer/api";
import {
  FileSystemAction,
  FileSystemOnChangePayload,
  FileSystemPayload,
  FileSystemType,
} from "@/types";

const Tree: FC<TreeProps> = ({
  data,
  onBlur,
  onChange,
  onClick,
  directory = { path: "", webcontainerPath: "" },
}) => {
  const newData = Object.entries(data).sort(function (a, b) {
    const isADirectory = "directory" in a[1];
    const isBDirectory = "directory" in b[1];
    if (!isADirectory && isBDirectory) {
      return 1;
    }
    if (isADirectory && !isBDirectory) {
      return -1;
    }
    if (a[0] < b[0]) {
      return -1;
    }
    if (a[0] > b[0]) {
      return 1;
    }
    return 0;
  });
  return (
    <ul>
      {newData.map((node) => {
        return (
          <TreeNode
            node={node}
            key={`${directory.path}/${node[0]}`}
            onBlur={onBlur}
            onChange={onChange}
            onClick={onClick}
            directory={directory}
          />
        );
      })}
    </ul>
  );
};

interface TreeProps {
  data: FileSystemTree;
  onBlur(action: "create" | "rename", payload: FileSystemPayload): void;
  onChange(
    action: FileSystemAction,
    type: FileSystemType,
    payload: FileSystemOnChangePayload
  ): void;
  onClick(code: string, path: { path: string; webcontainerPath: string }): void;
  directory?: { path: string; webcontainerPath: string };
}

export default Tree;
