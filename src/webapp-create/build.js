import fs from "fs";
import path from "path";
import fse from "fs-extra";
import { spawnSync } from "child_process";
import { createDistPackage, outPath } from "build-utils";

spawnSync("tsc", [], {
    stdio: ["ignore", "inherit", "inherit"],
    shell: true
});

const newPkg = createDistPackage();

fse.copySync("template", path.join(outPath, "template"), { overwrite: true });

fs.writeFileSync(path.join(outPath, "package.json"), JSON.stringify(newPkg, null, 4));