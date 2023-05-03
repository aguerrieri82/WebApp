import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";
import { formatStyle } from "../TextUtils";

export class StyleAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Attr): boolean {

        return node.nodeType == 2 && node.name.toLowerCase().startsWith(ctx.htmlNamespace + ":style-");
    }

    handle(ctx: TemplateContext, node: Attr): HandleResult {

        const styleName = formatStyle(node.nodeName.substring(ctx.htmlNamespace.length + 7));

        ctx.writer.write(".style(").writeJson(styleName).write(", ").writeBinding(node.value).write(")");

        return HandleResult.Handled;
    }

}