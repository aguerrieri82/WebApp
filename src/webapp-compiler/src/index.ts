export * from "./Abstraction/ITemplateHandler.js";
export * from "./HtmlCompiler.js";
export * from "./JsxCompiler.js";

import { runTest2 } from "./Test.js";

if (process.argv[2] == "-test") {

    runTest2();
}


