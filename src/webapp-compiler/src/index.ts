import { stderr, stdin } from "process";
import { TemplateCompiler } from "./TemplateCompiler";

export * from "./Abstraction/ITemplateHandler";
export * from "./TemplateCompiler";

async function run() {

    try {
        const compiler = new TemplateCompiler();

        await compiler.compileAsync("../../src/webapp-compiler/test/", null, true);
    }
    catch (ex) {

        stderr.write(ex.toString());
    }

    stdin.read();

    debugger;

}

//run();