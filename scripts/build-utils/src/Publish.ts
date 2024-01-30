import { IPackage, loadJson, pnpm } from "./Common.js";



export async function publishAsync() {

    const libPkg = loadJson<IPackage>("package.json");

    const libName = libPkg.name.substring(8);

    const outPath = "../../dist/" + libName;

    await pnpm(outPath, "publish", "--access public", "--no-git-checks");
}