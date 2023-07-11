import {
  FileSystemAction,
  FileSystemType,
  MapFileSystemActions,
} from "@/types";
import {
  mutateFileTreeOnCreate,
  mutateFileTreeOnDelete,
} from "@/mutations/fileTreeMutations";

export const mapFileSystemAction = (
  action: FileSystemAction,
  type: FileSystemType
) => {
  const actions: MapFileSystemActions = {
    create: {
      action: (fileData, payload) => {
        mutateFileTreeOnCreate(fileData, type, payload);
      },
    },
    delete: {
      action: (fileData, payload) => {
        mutateFileTreeOnDelete(fileData, payload);
      },
    },
  };
  return actions[action];
};
