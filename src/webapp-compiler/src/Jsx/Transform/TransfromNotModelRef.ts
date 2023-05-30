import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext";
import { Expression, Identifier, MemberExpression, ThisExpression, identifier } from "@babel/types";

export function TransfromNotModelRef(ctx: JsxParseContext, stage: "trans-exp", path: NodePath<Expression>) {

    if (stage != "trans-exp" /*|| ctx.curAttribute?.name.startsWith("t:on-")*/)
        return;

    let id : NodePath<Identifier|ThisExpression>;

    if (path.isMemberExpression() || path.isOptionalMemberExpression()) {

        const obj = (path as NodePath<MemberExpression>).get("object");

        if (!obj.isIdentifier() && !obj.isThisExpression())
            return;

        id = obj;
    }
    else if ((path.isIdentifier() || path.isThisExpression()) && (path.parentPath.isCallExpression() || path.parentPath.isOptionalCallExpression())) {

        id = path;
    }
    else
        return;

    const binding = path.scope.getBinding(id.toString());

    if (!binding?.identifier || (binding.identifier == ctx.curModel && !ctx.ignoreCurModel))
        return;

    const builder = ctx.findBuilder(binding?.identifier);

    const exp = builder ? `${builder}.model` : id.toString();

    if (ctx.curModel && !ctx.ignoreCurModel)
        ctx.replaceNode(id, `${ctx.curModel.name}[${ctx.useImport("USE")}](${exp})`);
    else
        ctx.replaceNode(id, exp);


    path.shouldSkip = true;

    return true;
}

export default TransfromNotModelRef;