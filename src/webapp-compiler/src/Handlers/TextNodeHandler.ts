import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateText, TemplateNodeType } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";
export class TextNodeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateText): boolean {

        return node.type == TemplateNodeType.Text;
    }

    handle(ctx: TemplateContext, element: ITemplateText): HandleResult {

        const trimText = ctx.compiler.options.includeWhitespace ? element.value : element.value.trim();

        if (trimText.length > 0 || ctx.compiler.options.includeWhitespace)
            ctx.writer.write(".text(").writeJson(trimText).write(")");

        return HandleResult.SkipChildren;
    }

}