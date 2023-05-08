import * as readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function questionAsync(prompt: string) {

    return new Promise((res, rej) => {
        rl.question(prompt, answer => {
            res(answer);
        })
    });
}

async function runAsync() {

    const appName = await questionAsync("App name: ");

}

runAsync(); 