import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext.js";
import * as types from "@babel/types";
import type { Expression } from "@babel/types";

function TransformEqualsHandler(ctx: JsxParseContext, stage: "trans-exp", path: NodePath<Expression>): boolean {

    if (stage != "trans-exp" || !path.isBinaryExpression())
        return;

    const op = path.node.operator;

    if (!(op == "==" || op == "===" || op == "!==" || op == "!="))
        return;

    const left = path.get("left");
    const right = path.get("right");

    if (ctx.hasModelRefs(left)) {
        left.replaceWith(types.callExpression(types.identifier(ctx.useImport("cleanProxy")), [left.node as Expression]));
    }

    if (ctx.hasModelRefs(right)) {
        right.replaceWith(types.callExpression(types.identifier(ctx.useImport("cleanProxy")), [right.node]));
    }

    return true;
}


export default TransformEqualsHandler;