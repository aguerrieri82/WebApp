import { stdin } from "process";
import { TemplateCompiler } from "./TemplateCompiler";
import * as path from "path";
import { JsxCompiler } from "./JsxCompiler";

export async function runTest1(){

    const compiler = new TemplateCompiler();

    var dir = path.dirname(".");

    await compiler.compileAsync("../../src/webapp-compiler/test/Index.html", null, true); 

    debugger;

    stdin.read();
}

export async function runTest2() {

    const compiler = new JsxCompiler();

    await compiler.compileAsync("../../src/webapp-compiler/test/Index.tsx", null, true);

    debugger;

    stdin.read();
}