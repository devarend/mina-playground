import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

interface FileTreeState {
  currentTreeItem: {
    currentDirectory: { path: string; webcontainerPath: string };
    code: string;
  };
  changedFields: Record<
    string,
    {
      code: string;
      saved: boolean;
    }
  >;
}

const initialState: FileTreeState = {
  currentTreeItem: {
    currentDirectory: { path: "", webcontainerPath: "" },
    code: "",
  },
  changedFields: {},
};

export const FileTreeSlice = createSlice({
  name: "fileTree",
  initialState,
  reducers: {
    setCurrentTreeItem: (
      state,
      action: PayloadAction<{
        currentDirectory: { path: string; webcontainerPath: string };
        code: string;
      }>
    ) => {
      state.currentTreeItem = action.payload;
    },
    setChangedFields: (
      state,
      action: PayloadAction<{ location: string; code: string }>
    ) => {
      const { location, code } = action.payload;
      state.changedFields = {
        ...state.changedFields,
        [location]: { code, saved: false },
      };
    },
    setChangedFieldStatus: (
      state,
      action: PayloadAction<{ location: string; saved: boolean }>
    ) => {
      const { location, saved } = action.payload;
      if (!(location in state.changedFields)) return;
      state.changedFields[location].saved = saved;
    },
  },
});

export const selectCurrentDirectory = (state: RootState) =>
  state.fileTree.currentTreeItem.currentDirectory;

export const selectCurrentTreeItem = (state: RootState) =>
  state.fileTree.currentTreeItem;

export const selectChangedFields = (state: RootState) =>
  state.fileTree.changedFields;

export const { setCurrentTreeItem, setChangedFields, setChangedFieldStatus } =
  FileTreeSlice.actions;

export default FileTreeSlice.reducer;
