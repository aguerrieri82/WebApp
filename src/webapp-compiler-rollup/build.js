import fs from "fs";
import extra from "fs-extra";
import path from "path";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const srcDir = "src";
const outDir = "../../dist/webapp-compiler-rollup/";

if (!fs.existsSync(outDir))
    fs.mkdirSync(outDir);

const newPkg = {
    name: pkg.name,
    version: pkg.version,
    type: "module",
    main: "index.js",
    dependencies: {
        "@eusoft/webapp-compiler": "../webapp-compiler" //"^0.0.4"
    }
}

extra.copySync(path.join(srcDir, "index.js"), path.join(outDir, "index.js"));

fs.writeFileSync(path.join(outDir, "package.json"), JSON.stringify(newPkg, null, 4));