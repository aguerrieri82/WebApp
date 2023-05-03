import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateAttribute } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";
import { formatStyle } from "../TextUtils";

export class StyleAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateAttribute): boolean {

        return  ctx.isAttr(node) && node.name.toLowerCase().startsWith(ctx.htmlNamespace + ":style-");
    }

    handle(ctx: TemplateContext, node: ITemplateAttribute): HandleResult {

        const styleName = formatStyle(node.name.substring(ctx.htmlNamespace.length + 7));

        ctx.writer.write(".style(").writeJson(styleName).write(", ").writeBinding(node.value).write(")");

        return HandleResult.Handled;
    }

}