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

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const outPath = "../../dist/" + pkg.name;

const typesPath = outPath + "/src/" + pkg.name + "/types";

const onwarn = (warning, warn) => {
    if (warning.code == "CIRCULAR_DEPENDENCY" || warning.code == "SOURCEMAP_BROKEN")
        return;
    warn(warning)
}

export default [
    {
        input: "src/index.ts",
        onwarn,
        external: Object.keys(pkg.dependencies ?? {}),
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
                baseContents: {
                    name: pkg.name,
                    type: "module",
                    main: "index.js",
                    types: "index.d.ts",
                    dependencies: pkg.dependencies ?? {},
                    peerDependencies: {
                        "webapp-core": "^0.0.1"
                    }
                }
            }),
            commonjs(),
            resolve(),
            typescript(),
            sourcemaps(),
            process.env.NODE_ENV == "prod" ? terser() : {}
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