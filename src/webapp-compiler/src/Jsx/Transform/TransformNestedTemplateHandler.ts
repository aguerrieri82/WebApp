import type { NodePath } from "@babel/traverse";
import { JsxParseContext } from "../JsxParseContext";

export function TransformNestedTemplateHandler(ctx: JsxParseContext, stage: "trans-exp", path: NodePath): boolean {

    if (!(stage == "trans-exp" && (path.isJSXFragment() || path.isJSXElement())))
        return;

    const newCtx = new JsxParseContext(ctx.compiler);

    const root = newCtx.parse(path);

    const text = ctx.compiler.generateTemplate(root);

    ctx.replaceNode(path, text);

    ctx.curModel = null;

    return true;
}

export default TransformNestedTemplateHandler;