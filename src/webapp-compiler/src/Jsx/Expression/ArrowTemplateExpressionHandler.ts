import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext";
import type  { Expression, Identifier } from "@babel/types";

export function ArrowTemplateExpressionHandler(ctx: JsxParseContext, stage: "exp", path: NodePath<Expression>): boolean {

    if (stage != "exp" || ctx.curAttribute)
        return;

    if (path.isArrowFunctionExpression() && ctx.isSingleElement(path.parentPath)) {
        const body = path.get("body");
        if (body.isJSXFragment() || body.isJSXElement()) {
    
            ctx.curModel = path.node.params[0] as Identifier;
            ctx.generateBuilder();
            if (ctx.curElement.name == "t:foreach" || ctx.curElement.name == "t:switch")
                ctx.createAttribute("as", ctx.curBuilder, ctx.curElement);
            return true;
        }
    }
}
export default ArrowTemplateExpressionHandler;