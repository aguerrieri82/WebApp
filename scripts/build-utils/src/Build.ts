
import path from "path";
import fs from "fs";


import { IPackage, colours, loadJson, logColor, pnpm, saveJson } from "./Common.js";
import { spawnSync } from "child_process";
import { mkdir } from "fs/promises";

export interface IBuildOptions {
    env?: string;
    isWatch?: boolean;
    includes?: string[];
    isBundle?: boolean;
}

function fixModule(path: string) {
    if (path.startsWith("link:")) {
        path = path.substring(5);
        if (path.endsWith("/src"))
            path = path.substring(0, path.length - 4);
    }
    return path;
}

function loadLibPackage(pkgPath: string) {

    const curPkg = loadJson<IPackage>(path.join(fixModule(pkgPath), "package.json"));
    return curPkg;
}

function processDeps(deps: Record<string, string>, isProd: boolean, isBoundle: boolean) {

    const newDeps = {};

    if (deps) {
        for (let name in deps) {
            const value = fixModule(deps[name]);

            if (value.startsWith("link:") && isBoundle) {
                const depPck = loadLibPackage(value);
                for (const depName in depPck.dependencies) 
                    newDeps[depName] = fixModule(depPck.dependencies[depName]);
                continue;
            }
    

            if (value.startsWith("link:") && isProd)
                newDeps[name] = "^" + loadLibPackage(value).version;
            else
                newDeps[name] = value;
        }
    }

    return newDeps;
}

export function createDistPackage(libPkg: IPackage, isProd: boolean, isBoundle: boolean) {
    const result : IPackage = {
        name: libPkg.name,
        version: libPkg.version,
        author: libPkg.author,
        keywords: libPkg.keywords,
        type: "module",
        main: "index.js",
        types: "index.d.ts",
        dependencies: processDeps(libPkg.dependencies, isProd, isBoundle),
        peerDependencies: processDeps(libPkg.peerDependencies, isProd, isBoundle)
    }
    return result;
}

function copyFiles(src: string, dst: string, filter: (a: string) => boolean) {
    function processDir(curSrc: string) {

        const relDir = path.relative(src,curSrc);
        const curDst = path.join(dst, relDir);

        mkdir(curDst, { recursive: true });

        fs.readdirSync(curSrc).forEach(file => {

            const fullSrc = path.join(curSrc, file);

            const isDir = fs.lstatSync(fullSrc).isDirectory() 

            if (isDir)
                processDir(fullSrc);

            else if (filter(fullSrc)) {
                const fullDst = path.join(curDst, file);
                console.log(fullSrc);
                fs.copyFileSync(fullSrc, fullDst);
            }

        });

    }

    processDir(src);
}

function tsc(outDir: string) {
    spawnSync("tsc", ["--outDir " + outDir, "--declarationDir " + outDir, "--noEmit false", "--declaration"], {
        shell: true,
        stdio: "inherit",
    });
}

function rollup(isWatch: boolean) {

    spawnSync("rollup", ["-c", isWatch ? "-w" : undefined], {
        shell: true,
        stdio: "inherit",
    });
}


export async function buildAsync(options: IBuildOptions) {

    try {
        const isProd = options.env == "prod";

        const libPkg = loadJson<IPackage>("package.json");

        const libName = libPkg.name.substring(8);

        const outPath = "../../dist/" + libName;

        const distPath = outPath;

        if (options.isBundle) {
            logColor(`Boundle\n`, colours.fg.green);
            rollup(options.isWatch);
        }
        else {
            if (fs.existsSync("tsconfig.json")) {

                logColor(`TS Build\n`, colours.fg.green);

                tsc(distPath);

                logColor(`Copy SCSS\n`, colours.fg.green);

                copyFiles("./src", distPath, a => a.endsWith(".scss"));

                logColor(`Copy d.ts\n`, colours.fg.green);

                copyFiles("./src", distPath, a => a.endsWith(".d.ts"));
            }
            else {
                logColor(`Copy JS\n`, colours.fg.green);
                copyFiles("./src", distPath, a => a.endsWith(".js"));
            }
        }



        if (options.includes) {

            for (const inc of options.includes) {
                logColor(`Copy ${inc}\n`, colours.fg.green);
                copyFiles(inc, path.join(distPath, inc), a => true);
            }
        }

        logColor(`Create package\n`, colours.fg.green);

        const pack = createDistPackage(libPkg, isProd, options.isBundle);
        saveJson(outPath + "/package.json", pack);

        logColor(`Install\n`, colours.fg.green);
        pnpm(outPath, "install", "--fix-lockfile");

        logColor(`DONE\n`, colours.fg.green);
    }
    catch (ex) {
        process.stderr.write(ex.toString());
    }
  
}