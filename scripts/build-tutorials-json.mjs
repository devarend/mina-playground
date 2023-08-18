import path from 'path'
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'fs'
import {getTutorial, getTutorialAndFiles} from "./build/tutorial.mjs";
import {transformToWebcontainerFiles} from "./build/webcontainer.mjs";
import {json} from "./build/fileSystem.mjs";

const excluded = ["base", "meta.json"];

let data = {};
const tutorialPaths = []
const dir = process.cwd();
const projectDir = readdirSync(`${dir}/tutorials`);

const mapTypeToResponse = async (type, c, s, options) => {
  switch (type) {
    case "unit":
    case "playground":
      return await getTutorialAndFiles(c, s, options);
    case "theory":
      const tutorial = await getTutorial(c, section);
      return {tutorial}
  }
}

for (const item of projectDir) {
  let baseFiles = {}
  const name = JSON.parse(
    readFileSync(`${dir}/tutorials/${item}/meta.json`, {
      encoding: "utf-8",
    })
  ).name;
  data[item] = {
    name,
    sections: {},
  };

  const baseFolderExists = existsSync(`${dir}/tutorials/${item}/base`)
  if (baseFolderExists) {
    baseFiles = transformToWebcontainerFiles(
        `${dir}/tutorials/${item}/base`
    );
  }

  const currentPath = path.join(`${dir}/tutorials/${item}`);
  const sections = readdirSync(currentPath).filter(
    (item) => !excluded.includes(item)
  );

  for (const section of sections) {
    const {name, type, options} = json(`${dir}/tutorials/${item}/${section}/meta.json`)
    const response = await mapTypeToResponse(type, item, section, options)

    const jsonData = {
      name,
      ...response
    }

    if (options?.base) {
      jsonData['files'] = {...response.files, ...baseFiles}
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
