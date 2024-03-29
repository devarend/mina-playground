import path from "path";
import {readdirSync, readFileSync, statSync} from "fs";

export const transformToWebcontainerFiles = (
    dir,
    files = {},
    filesArray = [],
    originalDir = dir
) => {
    const projectDir = readdirSync(dir);
    for (const item of projectDir) {
        const itemPath = path.join(dir, item);
        const stats = statSync(itemPath);
        if (stats.isDirectory()) {
            files[item] = {
                directory: {},
            };
            transformToWebcontainerFiles(itemPath, files[item].directory, filesArray, originalDir);
        } else {
            const fileContent = readFileSync(itemPath, { encoding: "utf-8" });
            files[item.replace(/\./g, "*")] = {
                file: {
                    contents: fileContent,
                },
            };
            const fileNameWithPath = itemPath.replace(originalDir, '')
            filesArray.push(fileNameWithPath)
        }
    }
    return {files, filesArray};
};

export const transformFocusedFiles = (
    dir,
    items,
    highlight
) => {
    let focusedFiles = {}
    let highlightedCode = ''
    for (const item of items) {
        const name = path.basename(item)
        const fileContent = readFileSync(`${dir}/${item}`, {encoding: "utf-8"})
        focusedFiles[name.replace(/\./g, "*")] = {
            file: {
                contents: fileContent
            }
        }
        if (item === highlight) {
            highlightedCode = fileContent
        }
    }
    return {focusedFiles, highlightedCode}
};
