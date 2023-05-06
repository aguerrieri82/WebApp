export * from "./Abstraction/ITemplateHandler";
export * from "./HtmlCompiler";
export * from "./JsxCompiler";

import { runTest2 } from "./Test";

if (process.argv[2] == "-test") {

    runTest2();
}


