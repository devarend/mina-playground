import { ParsedUrlQuery } from "querystring";

export type KeyValueObj = Record<string, any>;
export type FileSystemType = "directory" | "file";
export type FileSystemOnChangePayload = { path: string; key?: string };

type MapFileSystemAction = {
  action(data: KeyValueObj, payload: FileSystemOnChangePayload): void;
};

export type FileSystemPayload = {
  path: string;
  fullPath: string;
  key: string;
  value: string;
};

export type MapFileSystemActions = {
  create: MapFileSystemAction;
  delete: MapFileSystemAction;
};

export type FileSystemAction = keyof MapFileSystemActions;

export interface TutorialParams extends ParsedUrlQuery {
  chapter: string;
  section: string;
}
