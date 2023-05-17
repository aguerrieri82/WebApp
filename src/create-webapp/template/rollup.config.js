import resolve from "@rollup/plugin-node-resolve";
/*TS:import typescript from "@rollup/plugin-typescript";
*/import sourcemaps from "rollup-plugin-sourcemaps";
import webapp from "@eusoft/webapp-compiler-rollup"
import livereload from "rollup-plugin-livereload";
import terser from "@rollup/plugin-terser";
import del from "rollup-plugin-delete";
import path from "path";
import scss from "rollup-plugin-scss"
import { spawn } from "child_process";

const outPath = "public/build";

const isProduction = !process.env.ROLLUP_WATCH && process.env.NODE_ENV != "dev";

function serve() {
    let server;

    function toExit() {
        if (server)
            server.kill(0);
    }

    return {
        writeBundle() {

            if (server)
                return;

            server = spawn("npm", ["run", "start", "--", "--dev"], {
                stdio: ["ignore", "inherit", "inherit"],
                shell: true
            });

            process.on("SIGTERM", toExit);
            process.on("exit", toExit);
        }
    };
}

export default [
    {
        input: $(main),
        output: [
            {
                file: outPath + "/app.js",
                format: "esm",
                sourcemap: !isProduction,
                sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
                    return path.join(relativeSourcePath.substring(3));
                },
            },
        ],
        plugins: [
            del({
                targets: outPath + "/*",
                hook: "buildStart",
                runOnce: true
            }),
            resolve({
                browser: true,
            }),
            /*TS:typescript(),*/
            scss({
                fileName: "app.css",
                outputStyle: isProduction ? "compressed" : undefined,
            }),
            webapp(),
            !isProduction && livereload("public"),
            !isProduction && sourcemaps(),
            !isProduction && serve(),
            isProduction && terser({
                keep_classnames: true
            })
        ],
        watch: {
            clearScreen: false 
        }
    }
];