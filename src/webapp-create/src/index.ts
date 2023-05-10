import * as readline from "readline";
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import { stdin, stdout } from "process";


const __dirname = url.fileURLToPath(new URL('.', import.meta.url));



const THEME = {
    labelColor: "1E88E5",
    selectedValue: "9C27B0",
    value: "78909C",
    check: "388E3C",
    bullet: "FFFFFF",

}

interface ITemplate {
    name: string;
    source: string;
    transforms: string[];
    use: string[];
    content: Record<string, string[]>;
    packages: Record<string, Record<string, string>>;
}

interface IInputValue {
    text: string;
    value: string;
}

interface ITemplateArgs {
    projectName: string;
    lang: "ts" | "js";
    ui: boolean;
    jsx: boolean;
    vs: boolean;
}

function tempDir(dir: string) {

    return path.join(__dirname, dir);
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

function readCharAsync() {

    return new Promise<string>(res => {
        stdin.setRawMode(true);
        stdin.resume();
        hideCursor();
        const handler = (data: Buffer) => {
            res(data.toString("utf8"));
            stdin.removeListener("data", handler);
            stdin.setRawMode(false);
            showCursor();
        }
        stdin.on("data", handler);
    });



    stdin.resume();
    stdin.setEncoding('utf8');
    hideCursor();
    const readBuffer = Buffer.alloc(1);
    fs.readSync(0, readBuffer, 0, 1, undefined);
    stdin.setRawMode(false);
    showCursor();
    return readBuffer.toString('utf8')
}

async function readLineAsync(prompt: string) {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const result = await new Promise<string>(res => rl.question(prompt, res));

    rl.close();

    return result;
}

function hideCursor() {
    write("\u001B[?25l");
}

function showCursor() {
    write("\u001B[?25h");
}

function saveCursor() {
    write("\x1b[s");
}

function restoreCursor() {
    write("\x1b[u");
}

async function inputTextAsync<T>(prompt: string, defValue?: string, validate?: (v: string) => boolean) {

    const promptFull = getColor(THEME.bullet) + "• " + getColor(THEME.labelColor) + prompt + ": " + getColor();

    while (true) {

        saveCursor();

        let result = await readLineAsync(promptFull);

        if (result.length == 0)
            result = defValue;

        restoreCursor();

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

        saveCursor();

        stdout.clearLine(0);

        let promptFull = getColor(THEME.bullet) + "• " + getColor(THEME.labelColor) + prompt + "? " + getColor();

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

        restoreCursor();

        stdout.clearLine(0);
        stdout.cursorTo(0);

    }
}


async function createTemplateAsync(template: ITemplate, args: ITemplateArgs, dir: string) {

}



async function queryArgsAsync()  {
    const result = {} as ITemplateArgs;

    result.projectName = await inputTextAsync("Project name", "", a => /([A-Za-z0-9]|-_)+/.test(a));
    result.lang = (await inputBoolAsync("Use typescript", true)) ? "ts" : "js";
    result.jsx = (await inputBoolAsync("Use JSX", true));
    result.ui = (await inputBoolAsync("Use UI component library", true));
    return result;
}


async function runAsync() {

    console.log("Hello");

    const template = readJson<ITemplate>(tempDir("template/template.json"));

    const args = await queryArgsAsync();

    await createTemplateAsync(template, args, args.projectName);

    debugger;
}

runAsync(); 