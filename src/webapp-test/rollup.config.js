import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import sourcemaps from 'rollup-plugin-sourcemaps';
import webapp from "@eusoft/webapp-compiler-rollup"
import path from "path";
import scss from 'rollup-plugin-scss'

const outPath = "public/build";

export default [
    {
        input: "src/index.tsx",
        output: [
            {
                file: outPath + "/app.js",
                format: "esm",
                sourcemap: true,
                sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
                    const result = path.resolve(path.dirname(sourcemapPath), relativeSourcePath)
                    return result;
                },
            },
        ],
        plugins: [
            resolve(),
            typescript({
                filterRoot: "../" 
            }),
            scss({
                fileName: 'style.css'
            }),
            webapp(),
            sourcemaps()
        ]
    }
];