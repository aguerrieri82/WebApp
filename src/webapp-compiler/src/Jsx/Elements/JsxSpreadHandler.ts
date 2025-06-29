import type  { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext.js";

export function JsxSpreadHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter" || !path.isJSXSpreadAttribute())
        return;

    if (ctx.curElement.name != "t:component")
        return ctx.error(path, "Spread operator is supported only in components");

    ctx.curAttribute = ctx.createAttribute("t:options", undefined, ctx.curElement);

    return true;
}

export default JsxSpreadHandler;