import { stdin } from "process";
import { TemplateCompiler } from "./TemplateCompiler";

export * from "./Abstraction/ITemplateHandler";
export * from "./TemplateCompiler";

async function run() {

    const compiler = new TemplateCompiler();

    await compiler.compileAsync("../../src/webapp-compiler/test/Container.html", null, true);

    stdin.read();
    debugger;

}

run();