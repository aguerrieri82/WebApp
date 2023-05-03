import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import generatePackageJson from 'rollup-plugin-generate-package-json'
import sourcemaps from 'rollup-plugin-sourcemaps';
import del from "rollup-plugin-delete";
import path from "path";
import commonjs from '@rollup/plugin-commonjs';
import fs from 'fs';

export const isProd = process.env.NODE_ENV == "prod";

export const libPkg = loadJson("package.json");

export const libName = libPkg.name.substring(7);

export const outPath = "../../dist/" + libName;

export function loadJson(path) {
    return JSON.parse(fs.readFileSync(path, "utf8"));
}

export function getPkgVersion(pkgPath) {

    if (pkgPath.startsWith("file://"))
        pkgPath = pkgPath.substring(7);

    const curPkg = loadJson(path.join(pkgPath, "package.json"));
    return curPkg.version;
}

export function processDeps(deps) {

    const newDeps = {};

    if (deps) {
        for (let name in deps) {
            const value = deps[name];
            if (value.startsWith("file://") && isProd)
                newDeps[name] = "^" + getPkgVersion(value);
            else
                newDeps[name] = value;
        }
    }

    return newDeps;
}

export function createDistPackage() {
    return {
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
}

export function configureRollup() {

    const typesPath = outPath + "/src/" + libName + "/types";

    const onwarn = (warning, warn) => {
        if (warning.code == "CIRCULAR_DEPENDENCY" || warning.code == "SOURCEMAP_BROKEN")
            return;
        warn(warning)
    }

    return [
        {
            input: "src/index.ts",
            onwarn,
            external: Object.keys(libPkg.dependencies ?? {}),
            output: [
                {
                    file: outPath + "/index.js",
                    format: "esm",
                    sourcemap: true,
                    sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
                        return path.resolve(path.dirname(sourcemapPath), relativeSourcePath)
                    },
                },
            ],
            plugins: [
                generatePackageJson({
                    baseContents: createDistPackage()
                }),
                commonjs(),
                resolve(),
                typescript(),
                sourcemaps(),
                isProd && terser()
            ]
        },
        {
            onwarn,
            input: typesPath + "/index.d.ts",
            output: [{ file: outPath + "/index.d.ts", format: "esm" }],
            external: [/\.scss$/, /\.html/, /\.svg/],
            plugins: [
                dts(),
                del({
                    targets: outPath + "/src",
                    hook: 'buildEnd',
                    force: true,
                    runOnce: true
                })
            ]
        },
    ];
}