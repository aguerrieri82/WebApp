import { type NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext.js";
import { type Expression } from "@babel/types";

function ConditionalExpressionHandler(ctx: JsxParseContext, stage: "exp", path: NodePath<Expression>): boolean {

    if (stage != "exp" || ctx.curAttribute || !path.isConditionalExpression())
        return;

    const curElement = ctx.curElement;

    const ifElement = ctx.enterNewElement("t:if");
    ctx.curAttribute = ctx.createAttribute("condition", null, ctx.curElement);

    path.get("test").visit();
    ctx.curAttribute = null;

    path.get("consequent").visit();

    ctx.tryEnterElement(ifElement);

    ctx.enterNewElement("t:else");

    path.get("alternate").visit();

    while(ctx.curElement != curElement)
        ctx.exitElement();

    path.shouldSkip = true;

    return true;
}

export default ConditionalExpressionHandler;