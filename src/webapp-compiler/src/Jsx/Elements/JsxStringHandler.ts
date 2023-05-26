import type { NodePath } from "@babel/traverse";
import type { JsxParseContext } from "../JsxParseContext";
import type { TemplateNodeType } from "../../Abstraction/ITemplateNode";

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