import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import sourcemaps from 'rollup-plugin-sourcemaps';
import webapp from "@eusoft/webapp-compiler-rollup"
import path from "path";

const outPath = "public/build";

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: outPath + "/app.js",
                format: "esm",
                sourcemap: true,
                sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
                    return path.resolve(path.dirname(sourcemapPath), relativeSourcePath)
                },
            },
        ],
        plugins: [
            webapp(),
            resolve(),
            typescript(),

            sourcemaps()
        ]
    }
];