import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext.js";
import { Expression, Identifier, MemberExpression, ThisExpression } from "@babel/types";

export function TransfromNotModelRef(ctx: JsxParseContext, stage: "trans-exp", path: NodePath<Expression>) {

    if (stage != "trans-exp" /*|| ctx.curAttribute?.name.startsWith("t:on-")*/)
        return;

    let id: NodePath<Identifier | ThisExpression>
    if (path.isMemberExpression() || path.isOptionalMemberExpression()) {

        const obj = (path as NodePath<MemberExpression>).get("object");

        if (!obj.isIdentifier() && !obj.isThisExpression())
            return;

        id = obj;
    }
    else if ((path.isIdentifier() || path.isThisExpression()) && (
        path.parentPath.isCallExpression() ||
        path.parentPath.isOptionalCallExpression() ||
        path.parentPath.isBinaryExpression() ||
        path.parentPath.isAssignmentExpression())) {

        id = path;
    }
    else
        return;

    const binding = path.scope.getBinding(id.toString());

    if (!binding?.identifier || (binding.identifier == ctx.curModel && !ctx.ignoreCurModel))
        return;

    const builder = ctx.findBuilder(binding?.identifier);

    const exp = builder ? `${builder}.model` : id.toString();

    /*
    TODO added && !builder in foreach if a refer a base model, and the item is not an object,
    i cannot use [USE] (es. for strings)
    */
    
    if (ctx.curModel && !ctx.ignoreCurModel && !builder)
        ctx.replaceNode(id, `${ctx.curModel.name}[${ctx.useImport("USE")}](${exp})`);
    else
        ctx.replaceNode(id, exp);


    path.shouldSkip = true;

    return true;
}

export default TransfromNotModelRef;