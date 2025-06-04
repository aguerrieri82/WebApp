import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext.js";

export function JsxErrorHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter")
        return;

    if (path.isJSXSpreadAttribute() || path.isJSXSpreadChild())
        throw path.buildCodeFrameError("Spread operator not supported in tsx/jsx (es. <div {...props}/>");
}

export default JsxErrorHandler;