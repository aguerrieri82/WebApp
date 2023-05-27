import { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext";
import { CallExpression, Expression, Identifier, MemberExpression } from "@babel/types";

export function ForeachExpressionHandler(ctx: JsxParseContext, stage: "exp", path: NodePath): boolean {

    if (stage != "exp" || ctx.curAttribute || (!path.isCallExpression() && !path.isOptionalCallExpression()))
        return;

    const pathTsShit = path as NodePath<CallExpression>;

    const calle = pathTsShit.get("callee");

    if (!(calle.isMemberExpression() || calle.isOptionalMemberExpression()))
        return;

    const callProp = (calle as NodePath<MemberExpression>).get("property");

    if (!callProp.isIdentifier() || callProp.node.name != "forEach")
        return;

    const body = pathTsShit.get("arguments")[0];

    if (!body.isArrowFunctionExpression())
        return;

    const params = body.get("params");
    if (params.length != 1 || !params[0].isIdentifier())
        return;

    ctx.enterNewElement("t:foreach");

    ctx.curAttribute = ctx.createAttribute("src", null, ctx.curElement);
    calle.get("object").visit();
    ctx.curAttribute = null;

    ctx.curModel = params[0].node as Identifier; 

    body.get("body").visit();

    ctx.exitElement();

    path.shouldSkip = true;

    return true;
}

export default ForeachExpressionHandler;