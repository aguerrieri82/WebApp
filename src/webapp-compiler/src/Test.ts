import { stdin } from "process";
import { JsxCompiler } from "./JsxCompiler.js";
import { HtmlCompiler } from "./HtmlCompiler.js";
export async function runTest1(){

    const compiler = new HtmlCompiler();

    await compiler.compileAsync("../../src/webapp-compiler/test/spellListTable.html", null, true); 

    debugger;

    stdin.read();
}

export async function runTest2() {

    const compiler = new JsxCompiler({
        extensions: [{
            component: "NodeView",
            builder: "nodeView(@content)"
        }]
    });

    await compiler.compileAsync("../../src/webapp-compiler/test/Index.tsx", null, true);

    debugger; 

    stdin.read();
}

