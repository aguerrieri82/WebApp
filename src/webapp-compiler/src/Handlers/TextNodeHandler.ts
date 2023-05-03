import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateText, TemplateNodeType } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";
export class TextNodeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateText): boolean {

        return node.type == TemplateNodeType.Text;
    }

    handle(ctx: TemplateContext, element: ITemplateText): HandleResult {

        if (element.value.trim().length > 0 || ctx.compiler.options.includeWhitespace)
            ctx.writer.write(".text(").writeJson(element.value).write(")");

        return HandleResult.SkipChildren;
    }

}