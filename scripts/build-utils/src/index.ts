import { buildAsync } from "./Build.js";
import { distributeAsync } from "./Distribute.js";
import { publishAsync } from "./Publish.js";
import { cleanAsync } from "./Clean.js";
import { chdir } from "process";

let mode: "build" | "dist" | "clean" | "publish";
let isWatch = false;
let isBundle = false;
let env: string = "prod";
let isPublish = false;
let isNewVer = false;
let includes: string[] = [];


for (const arg of process.argv.splice(2)) {

    if (arg == "--build")
        mode = "build";

    else if (arg == "--dist")
        mode = "dist";

    else if (arg == "--bundle")
        isBundle = true;

    else if (arg == "--clean")
        mode = "clean";

    else if (arg == "--watch")
        isWatch = true;

    else if (arg.startsWith("--env:"))
        env = arg.substring(6);

    else if (arg == "--publish") {
        isPublish = true;
        env = "prod";
        if (!mode)
            mode = "publish";
    }
    else if (arg == "--new")
        isNewVer = true;

    else if (arg.startsWith("--lib:"))
        chdir(arg.substring(6));

    else if (arg.startsWith("--include:"))
        includes.push(arg.substring(10))
}

if (!mode || mode == "build")
    await buildAsync({
        env,
        isWatch,
        includes,
        isBundle
    });

else if (mode == "dist")
    await distributeAsync({
        env,
        isNewVer,
        isPublish,
    });

else if (mode == "publish") {
    await publishAsync();
}

else if (mode == "clean") {
    await cleanAsync();
}