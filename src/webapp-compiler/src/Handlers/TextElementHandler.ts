import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement, ITemplateText, TemplateNodeType } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";
export class TextElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateElement): boolean {

        return ctx.isElement(node, "text");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        const source = element.attributes.src?.value;

        if (!source) {
            ctx.error("Source not specified in text");
            return HandleResult.Error;
        }
        ctx.writer.write(".text(").writeBinding(source).write(")");

        return HandleResult.SkipChildren;
    }

}