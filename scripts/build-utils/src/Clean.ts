import { IPackage, loadJson, pnpm } from "./Common.js";
import fs from "fs";

export async function cleanAsync() {

    const libPkg = loadJson<IPackage>("package.json");

    const libName = libPkg.name.substring(8);

    const outPath = "../../dist/" + libName;

    fs.rmSync(outPath, { recursive: true, force: true });
}