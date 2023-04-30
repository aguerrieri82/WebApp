import fs from "fs";
import extra from "fs-extra";
import path from "path";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const srcDir = "src";
const outDir = "../../dist/" + pkg.name + "/";

if (!fs.existsSync(outDir))
    fs.mkdirSync(outDir);

const newPkg = {
    name: "@eusoft/" + pkg.name,
    version: pkg.version,
    type: "module",
    main: "index.js",
    dependencies: {
        "@eusoft/webapp-compiler": "^0.0.1"
    }
}

extra.copySync(path.join(srcDir, "index.js"), path.join(outDir, "index.js"));

fs.writeFileSync(path.join(outDir, "package.json"), JSON.stringify(newPkg, null, 4));