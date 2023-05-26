import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext";
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

    return true;
}


export default JsxAttributeHandler;