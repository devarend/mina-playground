import { FC, useState } from "react";
import Tree from "@/components/file-explorer/Tree";
import { DirectoryNode, FileNode } from "@webcontainer/api";
import {
  Directory,
  FileSystemOnBlurHandler,
  FileSystemOnChangeHandler,
  FileSystemOnClickHandler,
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
// TODO refactor this component
const TreeNode: FC<TreeNodeType> = ({
  node,
  onBlur,
  onChange,
  onClick,
  directory,
  enableActions,
}) => {
  const [key, value] = node;
  const currentDirectory = useAppSelector(selectCurrentDirectory);
  const changedFields = useAppSelector(selectChangedFields);

  const path = directory.path ? `${directory.path}/${key}` : `${key}`;
  const fileName = key.replace(/\*/g, ".");
  const [inputValue, setInputValue] = useState(fileName);
  const [isEditing, setIsEditing] = useState(false);
  const [showChildren, setShowChildren] = useState(
    currentDirectory.startsWith(path)
  );
  const inputFileName = inputValue.replace(/\./g, "*");
  const isDirectory = "directory" in value;
  const isSelected = path === currentDirectory;
  const isSelectedStyle = isSelected ? "bg-[#2f3033]" : "";
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
  const type = isDirectory ? "directory" : "file";

  const isEmptyKey = key === "";
  const showInputField = isEmptyKey || isEditing;
  const showActions = !isEmptyKey && !isEditing;
  return (
    <>
      <div
        onClick={handleClick}
        className={`group new-file hover:bg-[#131415] flex flex-row items-center mb-1 cursor-pointer ${isSelectedStyle}`}
      >
        <div className="flex flex-1 flex-row items-center">
          {showChevronIcon}
          {icon}
          {showInputField && enableActions ? (
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

                if (isEditing) {
                  onBlur("rename", type, {
                    path: directory.webcontainerPath,
                    key,
                    value: inputFileName,
                    directoryPath: directory.path,
                  });
                  return;
                }

                onBlur("create", type, {
                  path: directory.webcontainerPath,
                  key,
                  value: inputFileName,
                  fullPath: webcontainerPath,
                  directoryPath: directory.path,
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

                if (isEditing) {
                  onBlur("rename", type, {
                    path: directory.webcontainerPath,
                    key,
                    value: inputFileName,
                    directoryPath: directory.path,
                  });
                  return;
                }

                onBlur("create", type, {
                  path: directory.webcontainerPath,
                  key,
                  value: inputFileName,
                  fullPath: webcontainerPath,
                  directoryPath: directory.path,
                });
                setIsEditing(false);
                setShowChildren(false);
              }}
              className="pl-2 w-36 border border-gray-500 text-gray-100 rounded-md bg-gray-800"
            />
          ) : (
            <span className="p-[1px] text-sm font-light text-gray-200">
              {fileName}
            </span>
          )}
          {isChanged && (
            <svg width="16" height="16" fill="white" aria-hidden="true">
              <path d="M4 12L12 4M12 12L4 4" />
              <circle cx="8" cy="8" r="4" />
            </svg>
          )}
        </div>
        {showActions && enableActions && (
          <div className="hidden group-hover:block">
            <div className="flex flex-row gap-1">
              {isDirectory && (
                <>
                  <CreateFileActionIcon
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowChildren(true);
                      onChange("create", "file", {
                        path: webcontainerPath,
                        value: inputFileName,
                        directoryPath: directory.path,
                      });
                    }}
                  />
                  <CreateDirectoryActionIcon
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowChildren(true);
                      onChange("create", "directory", {
                        path: webcontainerPath,
                        value: inputFileName,
                        directoryPath: directory.path,
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
                    value: inputFileName,
                    directoryPath: directory.path,
                  });
                }}
              />
            </div>
          </div>
        )}
      </div>
      {isDirectory && (
        <ul className="pl-4">
          {showChildren &&
            (enableActions ? (
              <Tree
                data={value.directory}
                onBlur={onBlur}
                onChange={onChange}
                onClick={onClick}
                directory={{ path, webcontainerPath }}
                enableActions={enableActions}
              />
            ) : (
              <Tree
                data={value.directory}
                onClick={onClick}
                directory={{ path, webcontainerPath }}
                enableActions={enableActions}
              />
            ))}
        </ul>
      )}
    </>
  );
};

interface TreeNodeProps {
  node: [string, DirectoryNode | FileNode];
  onBlur?: never;
  onChange?: never;
  onClick: FileSystemOnClickHandler;
  directory: Directory;
  enableActions: false;
}

interface TreeNodePropsWithActions {
  node: [string, DirectoryNode | FileNode];
  onBlur: FileSystemOnBlurHandler;
  onChange: FileSystemOnChangeHandler;
  onClick: FileSystemOnClickHandler;
  directory: Directory;
  enableActions: true;
}

type TreeNodeType = TreeNodeProps | TreeNodePropsWithActions;

export default TreeNode;
