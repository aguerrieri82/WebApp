import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement, ITemplateNode } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";

export class ForeachElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "foreach");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        var source = element.attributes.src?.value;
        var builderName = element.attributes.as?.value;

        if (!source) {
            ctx.error("Source not specified in foreach");
            return HandleResult.Error;
        }
        ctx.setParameter("$index", `${ctx.currentFrame.builderNameJs}.index`);

        ctx.writer.ensureNewLine()
            .write(".foreach(").writeBinding(source).write(", ")
            .writeTemplate(undefined, builderName)
            .ensureNewLine().writeLine(")");

        return HandleResult.SkipChildren;
    }

}