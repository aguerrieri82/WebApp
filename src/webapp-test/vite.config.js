import { defineConfig } from 'vite';
import fs from 'fs';
import webapp from "@eusoft/webapp-compiler-rollup"


export default defineConfig({
    server: {
        https: {
            key: fs.readFileSync('./localhost-key.pem'),
            cert: fs.readFileSync('./localhost.pem'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {

            }
        }
    },
    esbuild: {
        jsx: "preserve"
    },
    build: {
        outDir: 'build',
    },
    publicDir: 'public',
    plugins: [webapp()],
});
