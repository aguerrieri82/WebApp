import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import generatePackageJson from 'rollup-plugin-generate-package-json'
import sourcemaps from 'rollup-plugin-sourcemaps';
import del from "rollup-plugin-delete";
import path from "path";

const packageJson = { name: "webapp-core" }

const outPath = "dist/" + packageJson.name;

const onwarn = (warning, warn) => {
    if (warning.code == "CIRCULAR_DEPENDENCY" || warning.code == "SOURCEMAP_BROKEN")
        return;
    warn(warning)
}

export default [
    {
        input: "src/index.ts",
        onwarn,
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

            resolve(),
            typescript(),
            sourcemaps(),
            process.env.NODE_ENV == "prod" ? terser() : {}
        ]
    },
    {
        onwarn,
        input: outPath + "/types/index.d.ts",
        output: [{ file: outPath + "/index.d.ts", format: "esm" }],
        external: [/\.scss$/, /\.html/, /\.svg/],
        plugins: [
            dts(),
            del({
                targets: outPath + '/types',
                hook: 'buildEnd',
                force: true,
                runOnce: true
            })
        ]
    },
];