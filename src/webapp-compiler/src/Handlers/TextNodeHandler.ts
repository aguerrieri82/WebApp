import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateText, TemplateNodeType } from "../Abstraction/ITemplateNode.js";
import { type TemplateContext } from "../TemplateContext.js";
export class TextNodeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateText): boolean {

        return node.type == TemplateNodeType.Text;
    }

    handle(ctx: TemplateContext, element: ITemplateText): HandleResult {

        const trimText = ctx.compiler.options.includeWhitespace ? element.value : element.value.trim();

        if (trimText.length > 0 || ctx.compiler.options.includeWhitespace)
            ctx.writer.write(".text(").writeJson(element.value).write(")");

        return HandleResult.SkipChildren;
    }

}