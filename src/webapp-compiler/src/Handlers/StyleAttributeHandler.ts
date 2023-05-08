import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateAttribute } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";
import { formatStyle } from "../TextUtils";

export class StyleAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateAttribute): boolean {

        return ctx.isAttr(node) &&
            node.name.toLowerCase().startsWith(ctx.htmlNamespace + ":style-") ||
            ctx.isAttr(node, "style");
    }

    handle(ctx: TemplateContext, node: ITemplateAttribute): HandleResult {

        if (ctx.isAttr(node, "style")) {

            ctx.writer.write(".style(").writeBinding(node.value).write(")");
        }
        else {
            const styleName = formatStyle(node.name.substring(ctx.htmlNamespace.length + 7));

            ctx.writer.write(".style(").writeJson(styleName).write(", ").writeBinding(node.value).write(")");
        }

        return HandleResult.Handled;
    }

}