import { type NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext.js";
import { type Expression } from "@babel/types";

export function AndExpressionHandler(ctx: JsxParseContext, stage: "exp", path: NodePath<Expression>): boolean {

    if (stage != "exp" || ctx.curAttribute || !path.isLogicalExpression() || path.node.operator != "&&")
        return;

    const right = path.get("right");

    if (!right.isJSXFragment() && !right.isJSXElement())
        return;

    ctx.enterNewElement("t:if");
    ctx.curAttribute = ctx.createAttribute("condition", null, ctx.curElement);

    const left = path.get("left");
    left.visit();

    ctx.curAttribute = null;

    right.visit();

    if (ctx.curElement?.name == "t:if")
        ctx.exitElement();

    path.shouldSkip = true;

    return true;
}

export default AndExpressionHandler;