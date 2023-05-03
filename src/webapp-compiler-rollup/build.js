import fs from "fs";
import extra from "fs-extra";
import path from "path";
import { createDistPackage, outPath } from "build-utils";

const srcDir = "src";

if (!fs.existsSync(outPath))
    fs.mkdirSync(outPath);

const newPkg = createDistPackage();

extra.copySync(path.join(srcDir, "index.js"), path.join(outPath, "index.js"));

fs.writeFileSync(path.join(outPath, "package.json"), JSON.stringify(newPkg, null, 4));