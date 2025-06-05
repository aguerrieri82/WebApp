import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext.js";

export function JsxErrorHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter")
        return;

    if (path.isJSXSpreadChild())
        return ctx.error(path, "Spread child operator not supported in tsx/jsx (es. <div>{...prop}</div>)");
}

export default JsxErrorHandler;