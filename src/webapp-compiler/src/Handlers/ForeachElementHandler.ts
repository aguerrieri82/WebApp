import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateElement, type ITemplateNode } from "../Abstraction/ITemplateNode.js";
import { type TemplateContext } from "../TemplateContext.js";

export class ForeachElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "foreach");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        const source = element.attributes.src?.value as string;
        const builderName = element.attributes.as?.value as string;

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