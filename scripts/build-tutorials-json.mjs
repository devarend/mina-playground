import path from 'path'
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'fs'
import {getTutorialAndFiles} from "./build/tutorial.mjs";
import {transformToWebcontainerFiles} from "./build/webcontainer.mjs";
import {json} from "./build/fileSystem.mjs";

const excludedFiles = ["meta.json"];
const excludedDirectories = ["bases"]

const defaultOptions = {
  initTerminal: true
}

let data = {};
const tutorialPaths = []
const dir = process.cwd();
const projectDir = readdirSync(`${dir}/tutorials`);
const baseDir = readdirSync(`${dir}/tutorials/bases`);

const mapTypeToResponse = async (type, c, s, options) => {
  switch (type) {
    case "deploy":
    case "playground":
      return await getTutorialAndFiles(c, s, options);
  }
}

for (const item of baseDir) {
  const {files: baseFiles} = transformToWebcontainerFiles(
      `${dir}/tutorials/bases/${item}`
  );
  writeFileSync(`${dir}/src/json/${item}-base.json`, JSON.stringify(baseFiles));
}

for (const item of projectDir) {
  if (excludedDirectories.includes(item)) continue
  const {name, base} = JSON.parse(
      readFileSync(`${dir}/tutorials/${item}/meta.json`, {
        encoding: "utf-8",
      })
  );

  data[item] = {
    name,
    base,
    sections: {},
  };

  const currentPath = path.join(`${dir}/tutorials/${item}`);
  const sections = readdirSync(currentPath)

  for (const section of sections) {
    if (excludedFiles.includes(section)) continue
    const {name, type, options} = json(`${dir}/tutorials/${item}/${section}/meta.json`)
    const currentOptions = {...defaultOptions, ...options}
    const response = await mapTypeToResponse(type, item, section, currentOptions)

    const jsonData = {
      type,
      base,
      ...response
    }

    writeFileSync(`${dir}/src/json/${item}-${section}.json`, JSON.stringify(jsonData));
    tutorialPaths.push({
      "params": {
        "chapter": item,
        "section": section
      }
    })


    data[item].sections[section] = {
      name,
    };
  }
}
writeFileSync(`${dir}/src/tutorials.json`, JSON.stringify(data));
writeFileSync(`${dir}/src/tutorialPaths.json`, JSON.stringify({
  "paths": tutorialPaths,
  "fallback": false
}));
