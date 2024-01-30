import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext.js";
import { TemplateNodeType } from "../../Abstraction/ITemplateNode.js";

export function JsxStringHandler(ctx: JsxParseContext, stage: "enter", path: NodePath): boolean {

    if (stage != "enter" || !path.isStringLiteral())
        return;

    if (ctx.curAttribute)
        ctx.curAttribute.value = JSON.stringify(path.node.value);
    else {
        ctx.curElement.childNodes.push({
            type: TemplateNodeType.Text,
            value: path.node.value
        });
    }

    return true;
}

export default JsxStringHandler;