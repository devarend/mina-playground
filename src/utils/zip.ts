import JSZip from "jszip";
import { DirectoryNode, FileNode, FileSystemTree } from "@webcontainer/api";
import { normalizePath } from "@/utils/fileSystemWeb";

export const fileSystemTreeToZip = (obj: FileSystemTree, zipObject: JSZip) => {
  for (const key in obj) {
    const normalizedPath = normalizePath(key);
    if ("directory" in obj[key]) {
      const folder = zipObject.folder(normalizedPath) as JSZip;
      fileSystemTreeToZip((obj[key] as DirectoryNode).directory, folder);
    }
    if ("file" in obj[key]) {
      const fileContent = (obj[key] as FileNode).file.contents;
      zipObject.file(normalizedPath, fileContent);
    }
  }
};
