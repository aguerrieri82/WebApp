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
                additionalData: `@import "/src/_vars.scss";\n`
            }
        }
    },
    esbuild: {
        jsx: "preserve"
    },
    publicDir: 'public',
    plugins: [webapp()],
});
