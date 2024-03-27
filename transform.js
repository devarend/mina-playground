import fs from "fs/promises";
import path from "path";

async function transformToWebcontainerFiles(dir, files = {}) {
  const projectDir = await fs.readdir(dir);
  for (const item of projectDir) {
    const itemPath = path.join(dir, item);
    const stats = await fs.stat(itemPath);
    if (stats.isDirectory()) {
      files[item] = {
        directory: {},
      };
      await transformToWebcontainerFiles(itemPath, files[item].directory);
    } else {
      const fileName = path.basename(item);
      const fileContent = await fs.readFile(itemPath, { encoding: "utf-8" });
      files[fileName.replace(/\./g, "*")] = {
        file: {
          contents: fileContent,
        },
      };
    }
  }
  return files;
}

const filesContent = await transformToWebcontainerFiles("./zk-app");
await fs.writeFile(
  "./files.js",
  `/** @satisfies {import('@webcontainer/api').FileSystemTree} */\nexport const files = ${JSON.stringify(
    filesContent
  )}`
);
