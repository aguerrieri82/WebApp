import type { NodePath } from "@babel/traverse";
import { trace, type JsxParseContext } from "../JsxParseContext.js";
import type { JSXIdentifier } from "@babel/types";

export function JsxAttributeHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter" || !path.isJSXAttribute())
        return;

    let name = (path.node.name as JSXIdentifier).name;

    if (ctx.curElement.name != "t:component")
        name = ctx.transformIntrinsicAttribute(name);

    ctx.curAttribute = ctx.createAttribute(name, null, ctx.curElement);

    if (!path.node.value)
        ctx.curAttribute.value = "true";

    trace("START: ", ctx.curAttribute?.name);

    return true;
}

export default JsxAttributeHandler;