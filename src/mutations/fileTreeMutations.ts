import { get } from "lodash";
import {
  FileSystemOnChangePayload,
  FileSystemPayload,
  FileSystemType,
  KeyValueObj,
} from "@/types";
import { getFileSystemValueByType } from "@/utils/fileSystemWeb";

export const mutateFileTreeCreateNew = (
  fileData: KeyValueObj,
  type: FileSystemType
) => {
  fileData[""] = getFileSystemValueByType(type);
};

export const mutateFileTreeOnBlur = (
  fileData: KeyValueObj,
  { path, key, value }: FileSystemPayload
) => {
  const foundItem = get(fileData, path || key) as Record<string, any>;
  if (!path) {
    fileData[value] = foundItem;
    delete fileData[key];
    return;
  }
  foundItem[value] = foundItem[key];
  delete foundItem[key];
};

export const mutateFileTreeOnCreate = (
  fileData: KeyValueObj,
  type: FileSystemType,
  { path }: FileSystemOnChangePayload
) => {
  const fileSystemValue = getFileSystemValueByType(type);
  const data = get(fileData, path);
  data[""] = fileSystemValue;
};

export const mutateFileTreeOnDelete = (
  fileData: KeyValueObj,
  { path, key }: FileSystemOnChangePayload
) => {
  if (!path) {
    delete fileData[key as string];
    return;
  }
  const foundItem = get(fileData, path) as Record<string, any>;
  delete foundItem[key as string];
};
