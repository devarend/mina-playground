import path from 'path'
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'fs'
import {transformToWebcontainerFiles} from "./build/webcontainer.mjs";
import {json} from "./build/fileSystem.mjs";
import {getFiles} from "./build/tutorial.mjs";

const excludedFiles = ["meta.json"];
const excludedDirectories = ["bases"]

let data = {};
const examplePaths = []
const dir = process.cwd();
const projectDir = readdirSync(`${dir}/examples`);
const baseDir = readdirSync(`${dir}/examples/bases`);

const defaultOptions = {
    initTerminal: true
}

for (const item of baseDir) {
    const {files: baseFiles} = transformToWebcontainerFiles(
        `${dir}/examples/bases/${item}`
    );
    writeFileSync(`${dir}/src/examples-json/${item}-base.json`, JSON.stringify(baseFiles));
}

for (const item of projectDir) {
    if (excludedDirectories.includes(item)) continue
    const {name, base} = JSON.parse(
        readFileSync(`${dir}/examples/${item}/meta.json`, {
            encoding: "utf-8",
        })
    );

    data[item] = {
        name,
        base,
        sections: {},
    };

    const currentPath = path.join(`${dir}/examples/${item}`);
    const sections = readdirSync(currentPath)

    for (const section of sections) {
        if (excludedFiles.includes(section)) continue
        const {name, type, options} = json(`${dir}/examples/${item}/${section}/meta.json`)
        const currentOptions = {...defaultOptions, ...options}
        const response = await getFiles(item, section, currentOptions)

        const jsonData = {
            type,
            base,
            ...response
        }

        writeFileSync(`${dir}/src/examples-json/${item}-${section}.json`, JSON.stringify(jsonData));
        examplePaths.push({
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
writeFileSync(`${dir}/src/examples.json`, JSON.stringify(data));
writeFileSync(`${dir}/src/examplePaths.json`, JSON.stringify({
    "paths": examplePaths,
    "fallback": false
}));
