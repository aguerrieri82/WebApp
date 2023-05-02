import { stdin } from "process";
import { TemplateCompiler } from "./TemplateCompiler";
import * as path from "path";

export async function runTest(){

    const compiler = new TemplateCompiler();

    var dir = path.dirname(".");

    await compiler.compileAsync("../../src/webapp-compiler/test/Index.html", null, true); 

    debugger;

    stdin.read();
}