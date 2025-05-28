import path from "path";
import { spawnSync } from 'child_process';
import { IPackage, colours, loadJson, logColor, pnpm, pnpmExec, saveJson } from './Common.js';


const libs = [
    "webapp-compiler",
    "webapp-compiler-rollup",
    "webapp-core",
    "webapp-jsx",
    "webapp-ui",
    "webapp-framework",
    "create-webapp"
];

interface IOptions {
    isPublish: boolean;
    isNewVer: boolean;
    env: string;
}


function incVersion(libPath: string) {

    const pkgDir = path.join(libPath, "package.json");

    const pkg = loadJson<IPackage>(pkgDir);
    const curVer = pkg.version;
    const parts = curVer.split(".");

    parts[2] = (parseInt(parts[2]) + 1).toString();
    pkg.version = parts.join(".");

    saveJson(pkgDir, pkg);

    logColor(`New version: ${pkg.version}\n`, colours.fg.blue);
}

async function processLib(libName: string, options: IOptions) {


    const basePath = "../../";

    const srcPath = path.join(basePath, "src");

    const distPath = path.join(basePath, "dist");


    try {
        logColor(`\nPROCESS '${libName}'\n\n`, colours.fg.green);

        const libSrcPath = path.join(srcPath, libName);
        const libDistPath = path.join(distPath, libName);

        if (options.isNewVer) {
            logColor("Increment version\n", colours.fg.black);

            incVersion(libSrcPath);
        }

        logColor(`Install\n`, colours.fg.blue);

        await pnpm(libSrcPath, "install");

        logColor(`Build\n`, colours.fg.blue);

        await pnpmExec(libSrcPath, "build:" + options.env);

        logColor(`Install dist\n`, colours.fg.blue);

        await pnpm  (libDistPath, "install", "--force");

        if (options.isPublish) {

            logColor(`Publish\n`, colours.fg.blue);

            await pnpm(libDistPath, "publish", "--access public", "--no-git-checks");
        }
    }
    catch (ex) {
        process.stderr.write(ex.toString());
    }
}

export async function distributeAsync(options: IOptions) {

    logColor(`DISTRIBUTE: ${options.env}\n\n`, colours.fg.green);

    for (const libName of libs)
        await processLib(libName, options);
}