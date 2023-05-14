import fs from 'fs';
import path from "path";
import { spawnSync } from 'child_process';

const colours = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",

    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m",
        crimson: "\x1b[38m" // Scarlet
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        gray: "\x1b[100m",
        crimson: "\x1b[48m"
    }
};

const libs = ["webapp-compiler", "webapp-compiler-rollup", "webapp-core", "webapp-jsx", "webapp-ui", "webapp-create"];

let mode = "dev";
let isPublish = false;
let isNewVer = false;

for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == "-prod")
        mode = "prod";
    if (process.argv[i] == "-publish" || process.argv[i] == "-p") {
        isPublish = true;
        mode = "prod";
    }
    if (process.argv[i] == "-new" || process.argv[i] == "-n")
        isNewVer = true;
}

const basePath = "../../";

const srcPath = path.join(basePath, "src");

const distPath = path.join(basePath, "dist");

function logColor(msg, color) {
    if (color)
        process.stdout.write(color);
    process.stdout.write(msg);
    if (color)
        process.stdout.write(colours.reset);
}

function loadJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
function saveJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function pnpmExec(libPath, script) {

    return pnpm(libPath, "run", script)
}

function pnpm(libPath, ...command) {

    spawnSync("pnpm", command, {
        cwd: libPath,
        shell: true,
        stdio: "inherit",
    });
}

function incVersion(libPath) {

    const pkgDir = path.join(libPath, "package.json");

    const pkg = loadJson(pkgDir);
    const curVer = pkg.version;
    const parts = curVer.split(".");

    parts[2] = parseInt(parts[2]) + 1;
    pkg.version = parts.join(".");

    saveJson(pkgDir, pkg);

    logColor(`New version: ${pkg.version}\n`, colours.fg.blue);
}

async function processLib(libName) {

    try {
        logColor(`\nPROCESS '${libName}'\n\n`, colours.fg.green);

        const libSrcPath = path.join(srcPath, libName);
        const libDistPath = path.join(distPath, libName);

        if (isNewVer) {
            logColor("Increment version\n", colours.fg.black);

            incVersion(libSrcPath);
        }

        logColor(`Install\n`, colours.fg.blue);

        await pnpm(libSrcPath, "install");

        logColor(`Build\n`, colours.fg.blue);

        await pnpmExec(libSrcPath, "build:" + mode);

        logColor(`Install dist\n`, colours.fg.blue);

        await pnpm(libDistPath, "install");

        if (isPublish) {

            logColor(`Publish\n`, colours.fg.blue);

            await pnpm(libDistPath, "publish", "--access public", "--no-git-checks");
        }
    }
    catch (ex) {
        process.stderr.write(ex.toString());
    }
}

async function runAsync() {

    logColor(`DISTRIBUTE: ${mode}\n\n`, colours.fg.green);

    for (const libName of libs)
        await processLib(libName);
}

runAsync();