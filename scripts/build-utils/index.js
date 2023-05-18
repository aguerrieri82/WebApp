import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import sourcemaps from 'rollup-plugin-sourcemaps';
import scss from 'rollup-plugin-scss'
import json from 'rollup-plugin-json'
import del from "rollup-plugin-delete";
import path from "path";
import commonjs from '@rollup/plugin-commonjs';
import fs from 'fs';
import fse from 'fs-extra';

const isProd = process.env.NODE_ENV == "prod";

const libPkg = loadJson("package.json");

const libName = libPkg.name.substring(7);

export const outPath = "../../dist/" + libName;

function loadJson(path) {
    return JSON.parse(fs.readFileSync(path, "utf8"));
}
function saveJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getPkgVersion(pkgPath) {

    if (pkgPath.startsWith("link:"))
        pkgPath = pkgPath.substring(5);

    const curPkg = loadJson(path.join(pkgPath, "package.json"));
    return curPkg.version;
}

function processDeps(deps) {

    const newDeps = {};

    if (deps) {
        for (let name in deps) {
            const value = deps[name];
            if (value.startsWith("link:") && isProd)
                newDeps[name] = "^" + getPkgVersion(value);
            else
                newDeps[name] = value;
        }
    }

    return newDeps;
}

export function createDistPackage() {
    const result = {
        name: libPkg.name,
        version: libPkg.version,
        author: libPkg.author,
        keywords: libPkg.keywords,
        type: "module",
        main: "index.js",
        types: "index.d.ts",
        dependencies: processDeps(libPkg.dependencies),
        peerDependencies: processDeps(libPkg.peerDependencies)
    }
    return result;
}

const external = [
    ...Object.keys(libPkg.dependencies ?? {}),
    ...Object.keys(libPkg.peerDependencies ?? {})
];
export function configureRollup(options) {

    const typesPath = outPath + "/src/" + libName + "/types";

    const onwarn = (warning, warn) => {
        if (warning.code == "CIRCULAR_DEPENDENCY" || warning.code == "SOURCEMAP_BROKEN")
            return;
        warn(warning)
    }

    const createPackage = {
        writeBundle() {
            saveJson(path.join(outPath, "package.json"), createDistPackage());
        }
    }

    const copyExtra = {
        writeBundle() {
            if (options?.include) {
                for (const src in options.include) {

                    fse.copySync(src, path.join(outPath, options.include[src]), { overwrite: true });
                }
            }
        }
    };


    return [
        {
            input: "src/index.ts",
            onwarn,
            external,
            output: [
                {
                    file: outPath + "/index.js",
                    format: "esm",
                    sourcemap: !isProd,
                    sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
                        return path.resolve(path.dirname(sourcemapPath), relativeSourcePath)
                    },
                },
            ],
            plugins: [
                createPackage,
                copyExtra,
                commonjs(),
                resolve(),
                typescript(),
                json(),
                options?.components && scss({
                    fileName: 'style.css'
                }),
                ...options?.plugins ?? [],
                !isProd && sourcemaps(),
                isProd && terser({
                    keep_classnames: true,
                    keep_fnames: options?.keepFunctions
                })
            ]
        },
        {
            onwarn,
            input: typesPath + "/index.d.ts",
            output: [{ file: outPath + "/index.d.ts", format: "esm" }],
            external: [/\.scss$/, /\.html/, /\.svg/, ...external],
            plugins: [
                dts(),
                del({
                    targets: outPath + "/src",
                    hook: 'buildEnd',
                    force: true,
                    runOnce: true
                }),
                isProd && del({
                    targets: outPath + "*.map",
                    hook: 'buildEnd',
                    force: true,
                    runOnce: true
                })
            ]
        },
    ];
}