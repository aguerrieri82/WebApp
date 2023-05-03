import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement, ITemplateNode } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";

export class ForeachElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "foreach");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        var source = element.attributes.src?.value;
        var modelName = element.attributes.as?.value;

        if (!source) {
            ctx.error("Source not specified in foreach");
            return HandleResult.Error;
        }

        if (modelName) {
            ctx.setParameter("$" + modelName, "m");
            ctx.setParameter("$model", `${ctx.currentFrame.builderNameJs}.model`);
        }

        ctx.setParameter("$index", `${ctx.currentFrame.builderNameJs}.index`);

        ctx.writer.ensureNewLine()
            .write(".foreach(").writeBinding(source).write(", ")
            .writeTemplate()
            .ensureNewLine().writeLine(")");

        return HandleResult.SkipChildren;
    }

}