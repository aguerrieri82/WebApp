import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext";

export function JsxExpressionHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter" || path.isJSXFragment() || path.isJSXElement() || !path.isExpression())
        return;

    if (!ctx.curElement && !ctx.curAttribute)
        return;

    for (const handler of ctx.handlers) {
        if (handler(ctx, "exp", path))
            return;
    }

    let createBind = !ctx.isBinding(path) && ctx.isBindable();

    const bindMode = ctx.withModel(createBind ? ctx.curModel : null, () => ctx.transformExpression(path));

    if (bindMode == "no-bind" || bindMode == "action") {
        ctx.curModel = null;
        createBind = false;
    }

    let value = path.toString();

    if (createBind) {

        if (path.isObjectExpression())
            value = "(" + value + ")";

        value = ctx.curModel.name + " => " + value;
    }

    if (ctx.curAttribute) {
        ctx.curAttribute.value = value;
        ctx.curAttribute.bindMode = bindMode;
    }
    else {

        ctx.enterNewElement("t:content")
        ctx.createAttribute("src", value, ctx.curElement);
        ctx.exitElement();
    }

    path.shouldSkip = true;

    return true;
}


export default JsxExpressionHandler;