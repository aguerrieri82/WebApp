import { spawnSync } from 'child_process';
import fs from 'fs';

export interface IPackage {
    name: string;
    version: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    keywords?: string[];
    author?: string;
    main?: string;
    types?: string;
    type?: "module";
}

export const colours = {
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

export function loadJson<T>(path: string) {
    return JSON.parse(fs.readFileSync(path, "utf8")) as T;
}
export function saveJson(filePath: string, data: unknown) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function logColor(msg: string, color: string) {
    if (color)
        process.stdout.write(color);
    process.stdout.write(msg);
    if (color)
        process.stdout.write(colours.reset);
}


export function pnpmExec(libPath: string, script: string) {

    return pnpm(libPath, "run", script)
}

export function pnpm(libPath: string, ...command: string[]) {

    spawnSync("pnpm", command, {
        cwd: libPath,
        shell: true,
        stdio: "inherit",
        env: {
            ...process.env,
            CI: 'true'
        }
    });
}
