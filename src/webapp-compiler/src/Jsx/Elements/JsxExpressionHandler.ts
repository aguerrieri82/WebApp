import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext.js";
import { type BindMode } from "../../Abstraction/ITemplateNode.js";
import { toKebabCase } from "../../TextUtils.js";

export function JsxExpressionHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter" || path.isJSXFragment() || path.isJSXElement() || path.isJSXSpreadAttribute() || !path.isExpression())
        return;

    if (!ctx.curElement && !ctx.curAttribute)
        return;

    for (const handler of ctx.handlers) {
        if (handler(ctx, "exp", path))
            return;
    }

    let bindMode = ctx.getHelper(path)?.name as BindMode;

    let createBind = !ctx.isBinding(path) &&
        (bindMode || ctx.hasModelRefs(path) || ctx.hasTrackingRefs(path)) &&
        //!path.isArrayExpression() &&
        ctx.isBindable() &&
        bindMode != "no-bind" &&
        bindMode != "action";

    ctx.withModel(ctx.curModel, !createBind, () => ctx.transformExpression(path));

    if (bindMode == "no-bind" || bindMode == "action") 
        createBind = false;

    let value = path.toString();

    if (ctx.isBooleanExp())
        value = `((${value}) ? true : false)`;

    if (createBind) {

        if (path.isObjectExpression())
            value = `(${value})`;

        if (!bindMode) {
            value = `Bind.exp(${ctx.curModel?.name ?? "m"} => ${value})`;
            bindMode = "default";
        }
        else
            value = `${ctx.curModel.name} => ${value}`;

        ctx.replaceNode(path, value);
    }

    if (ctx.curAttribute) {
        ctx.curAttribute.value = value;
        ctx.curAttribute.bindMode = toKebabCase(bindMode) as BindMode;

    }
    else {

        ctx.enterNewElement("t:content")
        const attr = ctx.createAttribute("src", value, ctx.curElement);
        attr.bindMode = toKebabCase(bindMode) as BindMode;
        ctx.exitElement();
    }

    path.shouldSkip = true;

    return true;
}

export default JsxExpressionHandler;