import type  { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext.js";
import { type ITemplateText, TemplateNodeType } from "../../Abstraction/ITemplateNode.js";

export function JsxTextHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter" || !path.isJSXText())
        return;

    if (ctx.compiler.options.includeWhitespace || path.node.value.trim().length > 0) {

        const item: ITemplateText = {
            type: TemplateNodeType.Text,
            value: path.node.value
        }

        if (ctx.curElement)
            ctx.curElement.childNodes.push(item);
    }

    return true;
}

export default JsxTextHandler;