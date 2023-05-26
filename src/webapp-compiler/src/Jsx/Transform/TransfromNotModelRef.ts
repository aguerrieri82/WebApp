import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext";
import type { Expression } from "@babel/types";

export function TransfromNotModelRef(ctx: JsxParseContext, stage: "trans-exp", path: NodePath<Expression>) {

    if (stage != "trans-exp" /*|| ctx.curAttribute?.name.startsWith("t:on-")*/)
        return;

    if (!path.isMemberExpression())
        return;

    const obj = path.get("object");
    if (!obj.isIdentifier() && !obj.isThisExpression())
        return;

    const binding = path.scope.getBinding(obj.toString());

    if (binding && binding?.identifier == ctx.curModel)
        return;

    const builder = ctx.findBuilder(binding?.identifier);

    const exp = builder ? `${builder}.model` : obj.toString();

    if (ctx.curModel)
        ctx.replaceNode(obj, `${ctx.curModel.name}[${ctx.useImport("USE")}](${exp})`);
    else
        ctx.replaceNode(obj, exp);


    path.shouldSkip = true;

    return true;
}

export default TransfromNotModelRef;