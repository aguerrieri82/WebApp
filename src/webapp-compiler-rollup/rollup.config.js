import fs from 'fs'
import esbuild from 'rollup-plugin-esbuild'
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
    {
        plugins: [nodeResolve({ modulesOnly: true }), esbuild()],
        external: id =>
            !id.startsWith("@eusoft") &&
            !id.startsWith(".") &&
            !fs.existsSync(id),
        input: './src/index.js',
        output: [
            {
                file: "../../dist/webapp-compiler-rollup/dist/index.js",
                format: 'es',
                sourcemap: true,
            },
        ],
    }
]