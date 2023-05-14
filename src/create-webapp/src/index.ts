#! /usr/bin/env node

import * as readline from "readline";
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import { stdin, stdout } from "process";
import {  error } from "console";
import { randomInt } from "crypto";
import { spawn, exec } from "child_process";
import { Socket } from "net";
import open from "open";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));


const PARAM_REXP = /\$\(([^\)]+)\)/gm;

const BLOCK_REXP = /\/\*([a-zA-Z]+)\:([\s\S]+?)\*\//g;

var curStep: IStep;


const THEME = {
    label: "1E88E5",
    selectedValue: "9C27B0",
    step: "4CAF50",
    value: "78909C",
    check: "388E3C",
    bullet: "FFFFFF",
    error: "F44336"
}

type ContentType = "vs" | "ts" | "common" | "ui" | "js" |"jsx";

type Transform = (text: string) => string;

type InputValue<T> = [string, T];

interface IPoint {
    row: number;
    col: number;
}

interface IStep {
    text: string;
    timer: NodeJS.Timer;
    pos: IPoint;
}

interface ITemplate {
    name: string;
    source: string;
    transforms: string[];
    main: string;
    use: string[];
    content: Record<ContentType, string[]>;
    package: Record<string, IPackage>;
}

interface ITemplateVariant {
    name: string;
    template: ITemplate;
    path: string;
}

interface IPackage {
    packageManager: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
}

interface ITemplateArgs {
    projectName: string;
    lang: "ts" | "js";
    ui: boolean;
    jsx: boolean;
    vs: boolean;
    packManager: string;
    packVersion?: string;
    port?: number;
}

function getCursorPos() {

    return new Promise < IPoint>(res => {
        const termcodes = { cursorGetPosition: '\u001b[6n' };

        stdin.setRawMode(true);
        const readfx = function () {
   
            const buf = process.stdin.read();
            const xy = /\[(.*)/g.exec(buf)[0].replace(/\[|R"/g, '').split(';');
            const pos = { row: parseInt(xy[0]), col: parseInt(xy[1]) };
            stdin.setRawMode(false);
            res(pos);
        }

        process.stdin.once('readable', readfx);
        process.stdout.write(termcodes.cursorGetPosition);
    });
}

function tempDir(...dir: string[]) {

    return path.join(__dirname, ...dir);
}

function readJson<T>(filePath: string) {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function getColor(color?: string|number) {

    if (!color) 
        return "\x1B[0m";
    if (typeof color == "number") 
        return `\x1b[${color}m`

    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    return `\x1b[38;2;${r};${g};${b}m`;
}

function write(text: string) {
    return new Promise(res => stdout.write(text, res));
}

async function writeStep(text?: string, stepEffect = false) {

    async function doWrite(symb: string, color: string, first = false) {

        if (!first) {

            await clearLine();

            await cursorTo(0);
        }
        else
            await write("\n");

        await write(getColor(color) + symb + " " + getColor(THEME.step) + curStep.text + getColor());

        if (first && !stepEffect)
            await write("\n\n");

        if (stepEffect)
            await cursorTo(0);
    }

    if (curStep?.timer) {
        clearInterval(curStep.timer);
        await doWrite("✓", THEME.check);
        curStep = null;
    }

    if (!text)
        return;

    curStep = {
        pos: await getCursorPos(),
        text,
        timer: undefined
    };

    await doWrite("-", THEME.bullet, true);

    if (!stepEffect)
        return;

    let time = 0;

    curStep.timer = setInterval(async () => {

        let symb = '';

        switch (time) {
            case 0:
                symb = '-';
                break;
            case 1:
                symb = '\\';
                break;
            case 2:
                symb = '|';
                break;
            case 3:
                symb = '/';
                break;
        }

        await doWrite(symb, THEME.bullet);

        time = (time + 1) % 4;

    }, 100);
}

function writeInfo(label: string, value: string) {
    write(getColor(THEME.label) + label + " " + getColor(THEME.bullet) + value + "\n");
}

function writeError(msg: string) {
    write(getColor(THEME.error) + msg + getColor() + "\n");
    process.exit(0);
}

function readCharAsync() {

    return new Promise<string>(res => {

        stdin.setRawMode(true);
        stdin.resume();
        const handler = (data: Buffer) => {
            res(data.toString("utf8"));
            stdin.removeListener("data", handler);
            stdin.setRawMode(false);
        }
        stdin.on("data", handler);
    });
}

async function readLineAsync(prompt: string) {

    showCursor();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const result = await new Promise<string>(res => rl.question(prompt, res));

    rl.close();

    hideCursor();

    return result;
}

function hideCursor() {
    return write("\u001B[?25l");
}

function showCursor() {
    return write("\u001B[?25h");
}

function saveCursor() {
    return write("\x1b[s");
}

function restoreCursor() {
    return write("\x1b[u");
}

function cursorTo(x: number, y?: number) {
    return new Promise<void>(res => stdout.cursorTo(x, y, res));
}
function clearLine() {
    return new Promise<void>(res => stdout.clearLine(0, res));
}

async function inputTextAsync<T>(prompt: string, defValue?: string, validate?: (v: string) => boolean) {

    const promptFull = getColor(THEME.bullet) + "• " + getColor(THEME.label) + prompt + ": " + getColor();

    while (true) {

        await saveCursor();

        let result = await readLineAsync(promptFull);

        if (result.length == 0)
            result = defValue;

        await restoreCursor();

        if (!validate || validate(result)) {

            write(getColor(THEME.check) + "✓" + getColor());

            stdout.moveCursor(0, 1);
            stdout.cursorTo(0);
            stdout.clearLine(0);

            return result;
        }
    }
}

async function inputBoolAsync<T>(prompt: string, defValue?: boolean) {

    let curValue = defValue;

    let isValid = false;

    while (true) {

        await saveCursor();

        await clearLine();

        let promptFull = getColor(THEME.bullet) + "• " + getColor(THEME.label) + prompt + "? " + getColor();

        write(promptFull);

        write(getColor(curValue ? THEME.selectedValue : THEME.value));
        write("[Yes]");
        write(" ");
        write(getColor(!curValue ? THEME.selectedValue : THEME.value));
        write("[No]");
        write(getColor());

        if (isValid) {

            stdout.cursorTo(0);

            write(getColor(THEME.check) + "✓" + getColor());

            stdout.moveCursor(0, 1);
            stdout.cursorTo(0);
            stdout.clearLine(0);

            return curValue;
        }

        const c = await readCharAsync();

        switch (c) {
            case "\r":
                isValid = true;
                break;
            case "y":
            case "Y":
                isValid = true;
                curValue = true;
                break;
            case "n":
            case "N":
                isValid = true;
                curValue = false;
                break;
            case "\x1b[C":
                if (curValue)
                    curValue = !curValue;
                break;
            case "\x1b[D":
                if (!curValue)
                    curValue = !curValue;
                break;
        }

        await restoreCursor();

        stdout.clearLine(0);
        stdout.cursorTo(0);

    }
}


async function inputOptionAsync<T>(prompt: string, defOption: number, ...options: InputValue<T>[]) {

    let curValue = defOption;

    let isValid = false;

    while (true) {

        saveCursor();

        stdout.clearLine(0);

        let promptFull = getColor(THEME.bullet) + "• " + getColor(THEME.label) + prompt + ":" + getColor() + "\n";

        write(promptFull);

        options.forEach((o, i) => {

            write(getColor(curValue == i ? THEME.selectedValue : THEME.value));
            write("  " + i + " " + o[0] + "\n");
            write(getColor());
        });

        if (isValid) {

            restoreCursor();

            write(getColor(THEME.check) + "✓" + getColor());

            stdout.moveCursor(0, 1 + options.length);
            stdout.cursorTo(0);
            stdout.clearLine(0);

            return options[curValue][1];
        }

        const c = await readCharAsync();

        const num = parseInt(c);

        if (!isNaN(num) && num >= 0 && num < options.length) {
            isValid = true;
            curValue = num;
        }
        else {  
            switch (c) {
                case "\r":
                    isValid = true;
                    break;
                case "\x1b[A":
                    if (curValue > 0)
                        curValue--;
                    break;
                case "\x1b[B":
                    if (curValue < options.length - 1)
                        curValue++;
                    break;
            }
        }

        restoreCursor();

        stdout.clearLine(0);
        stdout.cursorTo(0);
    }
}

function extractContent(args: ITemplateArgs) {

    const result: ContentType[] = ["common"];
    if (args.vs)
        result.push("vs");
    if (args.ui)
        result.push("ui");
    if (args.jsx)
        result.push("jsx");
    result.push(args.lang);
    return result;
}

function getLastPackageVersionAsync(manager: string, name: string) {

    return new Promise<string>(res => {
        exec(manager + " view " + name + " version", (err, stdout) => {
            res(stdout.trim());
        });
    });
}

async function getLastPackageVersionsAsync(manager: string, ...name: string[]) {

    const versions = await Promise.all(name.map(n => getLastPackageVersionAsync(manager, n)));

    const result = {} as Record<string, string>;

    name.forEach((n, i) => result[n] = versions[i]);

    return result;
}

function launchAsync(cmd: string, cwd: string = ".", ...args: string[]) {

    return new Promise<boolean>(res => {

        const result = spawn(cmd, args, {
            shell: true,
            stdio: "inherit",
            cwd: path.resolve(cwd)
        });

        //result.stdout.pipe(process.stdout);
        //result.stderr.pipe(process.stderr);

        result.on("exit", code => {
            res(code == 0);
        })
    });
}


function findVariant(args: ITemplateArgs) {

    const srcDir = tempDir("template/src");
    const content = extractContent(args);

    const result: ITemplateVariant[] = [];

    let bestMatch, bestMatchCount: number;

    for (const entry of fs.readdirSync(srcDir)) {
        const template = readJson<ITemplate>(path.join(srcDir, entry, "template.json"));

        const matchCount = template.use.filter(a => content.indexOf(a as ContentType) != -1).length;

        if (matchCount < template.use.length)
            continue;

        result.push({
            name: entry,
            path: path.join("src", entry, args.lang),
            template
        });

        if (!bestMatchCount || matchCount > bestMatchCount) {
            bestMatch = result[result.length - 1];
            bestMatchCount = matchCount;
        }
  
    }

    return bestMatch;
}

async function createTemplateAsync(template: ITemplate, args: ITemplateArgs, dir: string) {

    const outPath = path.resolve(dir);
    const validContent = extractContent(args);
    const transforms: Record<string, Transform> = {}

    if (!args.port)
        args.port = randomInt(3000, 8000);

    const params = {
        "project-name": args.projectName,
        "port": args.port.toString(),
        "lang": args.lang,
        "gitignore": ".gitignore"
    } as Record<string, string>;

    params[args.lang] = "true";

    function replaceParams(text: string) {
        text = text.replace(PARAM_REXP, (_, p1: string) => params[p1]);
        text = text.replace(BLOCK_REXP, (_, p1: string, p2: string) => {
            if (params[p1.toLowerCase()])
                return p2;
            return "";
        });
        return text;
    }

    function processEntry(relPath: string, baseInPath = ".", baseOutPath = ".") {

        relPath = path.normalize(relPath);

        const inPath = tempDir("template", relPath);
        const outPath = path.resolve(dir, baseOutPath, replaceParams(path.relative(baseInPath, relPath)));

        const info = fs.lstatSync(inPath);

        if (info.isDirectory()) {

            for (const entry of fs.readdirSync(inPath))
                processEntry(path.join(relPath, entry), baseInPath, baseOutPath);
        }
        else {

            const ourDirName = path.dirname(outPath);

            if (!fs.existsSync(ourDirName))
                fs.mkdirSync(ourDirName, { recursive: true });

            if (relPath in transforms) {
                let text = fs.readFileSync(inPath, "utf8");

                text = transforms[relPath](text);

                fs.writeFileSync(outPath, text);
            }
            else
                fs.copyFileSync(inPath, outPath);
        }
    }

    if (fs.existsSync(outPath)) {

        if (fs.readdirSync(outPath).length > 0) {
            writeError(`${outPath}' is not empty`);
            return false;
        }
    }
    else {
        fs.mkdirSync(outPath, { recursive: true });
    }

    function processTemplate(curTemplate: ITemplate, baseInPath = ".", baseOutPath = ".", tempPath = baseInPath) {

        const content: string[] = [];

        if (curTemplate.content) {
            for (const key in curTemplate.content) {
                if (validContent.indexOf(key as ContentType) == -1)
                    continue;
                content.push(...curTemplate.content[key as ContentType]);
            }
        }
        else
            content.push(baseInPath);
     

        if (curTemplate.transforms) {
            for (const t of curTemplate.transforms)
                transforms[path.join(tempPath, t)] = text => replaceParams(text);
        }

        for (const entry of content)
            processEntry(entry, baseInPath, baseOutPath);
    }


    const variant = findVariant(args);

    const lastPackagesVers = await getLastPackageVersionsAsync(args.packManager,
        args.packManager,
        "@eusoft/webapp-compiler-rollup",
        "@eusoft/webapp-ui",
        "@eusoft/webapp-core",
        "@eusoft/webapp-jsx");

    if (!args.packVersion)
        args.packVersion = lastPackagesVers[args.packManager];

    transforms["package.json"] = text => {

        let pack = JSON.parse(replaceParams(text)) as IPackage;

        for (const content of validContent) {
            const item = template.package[content];
            if (item) {
       
                Object.assign(pack.devDependencies, item.devDependencies);
                Object.assign(pack.dependencies, item.dependencies);
            }
        }

        pack.dependencies["@eusoft/webapp-core"] = lastPackagesVers["@eusoft/webapp-core"];
        pack.devDependencies["@eusoft/webapp-compiler-rollup"] = lastPackagesVers["@eusoft/webapp-compiler-rollup"];

        if (args.ui)
            pack.dependencies["@eusoft/webapp-ui"] = lastPackagesVers["@eusoft/webapp-ui"];

        if (args.jsx)
            pack.dependencies["@eusoft/webapp-jsx"] = lastPackagesVers["@eusoft/webapp-jsx"];

        if (args.packManager != "npm")
            pack.packageManager = args.packManager + "@" + args.packVersion;

        return JSON.stringify(pack, null, 4);
    }

    params["main"] = JSON.stringify(replaceParams(path.join("src", variant.template.main)));

    processTemplate(template);
    processTemplate(variant.template, variant.path, "src", path.join(variant.path, ".."));

    return true;
}

async function queryArgsAsync()  {
    const result = {} as ITemplateArgs;

    result.projectName = await inputTextAsync("Project name", "", a => /([A-Za-z0-9]|-_)+/.test(a));
    result.lang = (await inputBoolAsync("Use typescript", true)) ? "ts" : "js";
    result.jsx = (await inputBoolAsync("Use JSX", true));
    result.ui = (await inputBoolAsync("Use UI component library", true));
    result.vs = (await inputBoolAsync("Visual studio/code support", true));
    result.packManager = await inputOptionAsync("Package manager",
        0,
        ["pnpm", "pnpm"],
        ["npm", "npm"],
        ["yarn", "yarn"],
    )
    return result;
}
async function waitForServerAsync(address: string, port: number) {

    while (true) {

        const result = await new Promise<boolean>(res => {

            try {
                const socket = new Socket();

                function fail(ex: any) {
                    socket.destroy();
                    res(false);
                }

                socket.setTimeout(1000);

                socket.on("timeout", fail);
                socket.on("error", fail);

                socket.connect(port, address, () => {
                    socket.destroy();
                    res(true);
                });
            }
            catch {
                res(false);
            }
        });

        if (result)
            break;
    }
}

async function runAsync() {

    console.clear();

    try {

        stdin.setEncoding('utf8');

        const template = readJson<ITemplate>(tempDir("template/template.json"));

        let args: ITemplateArgs = {
            jsx: true,
            lang: "ts",
            projectName: "web-app",
            ui: true,
            vs: true,
            packManager: "pnpm"
        }

        args = await queryArgsAsync();

        await writeStep("Creating project...", true);

        const outDir = path.join(process.cwd(), args.projectName);

        if (!await createTemplateAsync(template, args, outDir))
            return;

        await writeStep("Restoring packages...");

        await launchAsync(args.packManager, outDir, "install");

        await writeStep();

        await write("\n\n");

        const result = await inputBoolAsync("Launch application now", true);

        const url = "http://localhost:" + args.port + "/";

        if (!result) {
            write("\n");
            writeInfo(" • Run", args.packManager + " run dev");
            writeInfo(" • Open", url);

            write("\n");

            process.exit(0);
        }
        else {

            launchAsync(args.packManager, outDir, "run", "dev");

            await writeStep("Wating for dev server...");

            await waitForServerAsync("localhost", args.port);

            await writeStep("Launch browser");

            await open(url, {
                background: true,
                newInstance: true
            });

            await writeStep();
        }
    }
    catch (ex) {
        error(ex);
        process.exit(0);
    }
}

runAsync(); 