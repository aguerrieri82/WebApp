import { defineConfig } from 'vite';
import fs from 'fs';
import webapp from "@eusoft/webapp-compiler-rollup"
import path from "path";

export default defineConfig({
    resolve: {
        alias: {
            "@eusoft/webapp-core": path.resolve(__dirname, "../webapp-core/src"),
            "@eusoft/webapp-jsx": path.resolve(__dirname, "../webapp-jsx/src"),
            "@eusoft/webapp-framework": path.resolve(__dirname, "../webapp-framework/src"),
            "@eusoft/webapp-ui": path.resolve(__dirname, "../webapp-ui/src")
        }
    },
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
