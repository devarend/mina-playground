import { FC, useState } from "react";
import Tree from "@/components/file-explorer/Tree";
import { DirectoryNode, FileNode } from "@webcontainer/api";
import {
  FileSystemAction,
  FileSystemOnChangePayload,
  FileSystemPayload,
  FileSystemType,
} from "@/types";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DirectoryIcon,
  FileIcon,
} from "@/icons/FileSystemIcons";
import {
  CreateDirectoryActionIcon,
  CreateFileActionIcon,
  DeleteActionIcon,
  RenameActionIcon,
} from "@/icons/FileSystemActionIcons";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  selectChangedFields,
  selectCurrentDirectory,
} from "@/features/fileTree/fileTreeSlice";

const TreeNode: FC<TreeNodeProps> = ({
  node,
  onBlur,
  onChange,
  onClick,
  directory,
}) => {
  const [key, value] = node;
  const currentDirectory = useAppSelector(selectCurrentDirectory);
  const changedFields = useAppSelector(selectChangedFields);

  const path = directory.path ? `${directory.path}/${key}` : `${key}`;
  const fileName = key.replace(/\*/g, ".");
  const [inputValue, setInputValue] = useState(fileName);
  const [isEditing, setIsEditing] = useState(false);
  const [showChildren, setShowChildren] = useState(
    currentDirectory.path.startsWith(path)
  );
  const inputFileName = inputValue.replace(/\./g, "*");
  const isDirectory = "directory" in value;
  const isSelected = currentDirectory && path === currentDirectory.path;
  const isSelectedStyle = isSelected ? "bg-gray-200" : "";
  const webcontainer = isDirectory
    ? `${key || inputFileName}.directory`
    : `${key || inputFileName}.file.contents`;
  const webcontainerPath = directory.webcontainerPath
    ? `${directory.webcontainerPath}.${webcontainer}`
    : webcontainer;

  const handleClick = () => {
    if (!isDirectory) {
      const code = (value as FileNode).file.contents;
      onClick(code as string, { path, webcontainerPath });
      return;
    }
    setShowChildren(!showChildren);
  };

  const showChevronIcon =
    isDirectory && (showChildren ? <ChevronDownIcon /> : <ChevronRightIcon />);
  const icon = isDirectory ? <DirectoryIcon /> : <FileIcon />;

  const changedField = changedFields[webcontainerPath];
  const isChanged = changedField && !changedField.saved;

  return (
    <>
      <div
        onClick={handleClick}
        className={`group new-file hover:bg-gray-200 flex flex-row items-center mb-1 cursor-pointer ${isSelectedStyle}`}
      >
        <div className="flex flex-1 flex-row items-center">
          {showChevronIcon}
          {icon}
          {key === "" || isEditing ? (
            <input
              autoFocus
              onFocus={(e) => {
                e.target.setSelectionRange(0, e.target.value.lastIndexOf("."));
              }}
              onKeyPress={(event) => {
                if (event.key !== "Enter") return;
                if (key.replace(/\*/g, ".") === inputValue) {
                  setIsEditing(false);
                  setShowChildren(false);
                  return;
                }
                onBlur(isEditing ? "rename" : "create", {
                  path: directory.webcontainerPath,
                  fullPath: webcontainerPath,
                  key,
                  value: inputFileName,
                });
                setIsEditing(false);
                setShowChildren(false);
              }}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onBlur={() => {
                if (key.replace(/\*/g, ".") === inputValue) {
                  setIsEditing(false);
                  setShowChildren(false);
                  return;
                }
                onBlur(isEditing ? "rename" : "create", {
                  path: directory.webcontainerPath,
                  fullPath: webcontainerPath,
                  key,
                  value: inputFileName,
                });
                setIsEditing(false);
                setShowChildren(false);
              }}
              className="pl-2 border border-gray-300 rounded-md bg-gray-50"
            />
          ) : (
            <span className="text-sm">{fileName}</span>
          )}
          {isChanged && (
            <svg width="16" height="16" fill="black" aria-hidden="true">
              <path d="M4 12L12 4M12 12L4 4" />
              <circle cx="8" cy="8" r="4" />
            </svg>
          )}
        </div>
        {key !== "" && !isEditing && (
          <div className="hidden group-hover:block">
            <div className="flex flex-row gap-1">
              {isDirectory && (
                <>
                  <CreateFileActionIcon
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowChildren(true);
                      onChange("create", "file", { path: webcontainerPath });
                    }}
                  />
                  <CreateDirectoryActionIcon
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowChildren(true);
                      onChange("create", "directory", {
                        path: webcontainerPath,
                      });
                    }}
                  />
                </>
              )}
              <RenameActionIcon
                onClick={(event) => {
                  event.stopPropagation();
                  setInputValue(fileName);
                  setIsEditing(true);
                }}
              />
              <DeleteActionIcon
                onClick={(event) => {
                  event.stopPropagation();
                  onChange("delete", "file", {
                    path: directory.webcontainerPath,
                    key,
                  });
                }}
              />
            </div>
          </div>
        )}
      </div>
      {isDirectory && (
        <ul className="pl-4">
          {showChildren && (
            <Tree
              data={value.directory}
              onBlur={onBlur}
              onChange={onChange}
              onClick={onClick}
              directory={{ path, webcontainerPath }}
            />
          )}
        </ul>
      )}
    </>
  );
};

interface TreeNodeProps {
  node: [string, DirectoryNode | FileNode];
  onBlur(action: "create" | "rename", payload: FileSystemPayload): void;
  onChange(
    action: FileSystemAction,
    type: FileSystemType,
    payload: FileSystemOnChangePayload
  ): void;
  onClick(code: string, path: { path: string; webcontainerPath: string }): void;
  directory: { path: string; webcontainerPath: string };
}

export default TreeNode;
