import { stderr, stdin } from "process";
import { TemplateCompiler } from "./TemplateCompiler";
import { debug } from "console";

export * from "./Abstraction/ITemplateHandler";
export * from "./TemplateCompiler";

async function run() {

    try {
        const compiler = new TemplateCompiler();

        var xx = await compiler.compileTextAsync("<t:template name='MessageBox'/>");

        console.log(xx);

        await compiler.compileAsync("../../src/webapp-compiler/test/", null, true);
    }
    catch (ex) {

        stderr.write(ex.toString());
    }

    stdin.read();
}

//run();