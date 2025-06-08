import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateElement, type ITemplateNode } from "../Abstraction/ITemplateNode.js";
import { type TemplateContext } from "../TemplateContext.js";

export class ContentElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "content");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        const source = element.attributes.src?.value as string;
        const template = element.attributes.template?.value as string;
        const inline = element.attributes.inline?.value ?? "false" as string;
        const update = element.attributes.update?.value as string;

        if (!source) {
            ctx.error("Source not specified in content.");
            return HandleResult.Error;
        }

        if (template) {

            ctx.writer.write(".content(")
                .beginInlineFunction(ctx.getParameter("$model"))
                .write("(")
                .beginBlock()
                .ensureNewLine().write("model: ").writeBinding(source).write(",")
                .ensureNewLine().write("template: ").writeBinding(template)
                .endBlock()
                .write(")")
                .endInlineFunction()
                .write(")");
        }
        else {
            ctx.writer.write(".content(").writeBinding(source);
            ctx.writer.write(", ").write(inline);
            if (update)
                ctx.writer.write(", ").write(update);
            ctx.writer.write(")");
        }

        return HandleResult.SkipChildren;
    }

}