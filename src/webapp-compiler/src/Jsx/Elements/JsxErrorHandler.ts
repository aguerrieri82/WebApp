import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext";

export function JsxErrorHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter")
        return;
    /*
    if (ctx.curAttribute && (path.isJSXElement() || path.isJSXFragment()))
        throw path.buildCodeFrameError("JSX element or fragment in attributes is not supported");
    */
    if (path.isJSXSpreadAttribute() || path.isJSXSpreadChild())
        throw path.buildCodeFrameError("Spread operator not supported in tsx/jsx (es. <div {...props}/>");
}

export default JsxErrorHandler;