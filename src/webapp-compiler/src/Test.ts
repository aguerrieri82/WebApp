import { stdin } from "process";
import { JsxCompiler } from "./JsxCompiler";
import { HtmlCompiler } from "./HtmlCompiler";
export async function runTest1(){

    const compiler = new HtmlCompiler();

    await compiler.compileAsync("../../src/webapp-compiler/test/", null, true); 

    debugger;

    stdin.read();
}

export async function runTest2() {

    const compiler = new JsxCompiler();

    await compiler.compileAsync("../../src/webapp-compiler/test/Index.tsx", null, true);

    debugger; 

    stdin.read();
}

runTest2();