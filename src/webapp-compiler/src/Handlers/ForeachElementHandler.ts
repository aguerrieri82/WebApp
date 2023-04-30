import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";

export default class ForeachElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Node): boolean {

        return ctx.isElement(node, "foreach");
    }

    handle(ctx: TemplateContext, element: Element): HandleResult {

        var source = element.getAttribute("src");
        var modelName = element.getAttribute("as");

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