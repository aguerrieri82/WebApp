import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";

export class ContentElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Node): boolean {

        return ctx.isElement(node, "content");
    }

    handle(ctx: TemplateContext, element: Element): HandleResult {

        const source = element.getAttribute("src");
        const template = element.getAttribute("template");
        const inline = element.getAttribute("inline");

        if (!source) {
            ctx.error("Source not specified in content.");
            return HandleResult.Error;
        }

        if (template)
            ctx.writer.write(".template(").writeJson(template).write(", ").writeBinding(source).write(")");
        else {
            ctx.writer.write(".content(").writeBinding(source);
            if (inline == "true")
                ctx.writer.write(", true");
            ctx.writer.write(")");
        }


        return HandleResult.SkipChildren;
    }

}