import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { ITemplateAttribute } from "../Abstraction/ITemplateNode.js";
import { TemplateContext } from "../TemplateContext.js";
import { formatStyle } from "../TextUtils.js";

export class StyleAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateAttribute): boolean {

        return ctx.isAttr(node) &&
            node.name.toLowerCase().startsWith(ctx.htmlNamespace + ":style-") ||
            ctx.isAttr(node, "style");
    }

    handle(ctx: TemplateContext, node: ITemplateAttribute): HandleResult {

        if (ctx.isAttr(node, "style")) {

            ctx.writer.write(".style(").writeBinding(node.value as string).write(")");
        }
        else {
            const styleName = formatStyle(node.name.substring(ctx.htmlNamespace.length + 7));

            ctx.writer.write(".style(").writeJson(styleName).write(", ").writeBinding(node.value as string).write(")");
        }

        return HandleResult.Handled;
    }

}