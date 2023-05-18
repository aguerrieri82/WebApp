import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement, ITemplateNode } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";

export class ContentElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "content");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        const source = element.attributes.src?.value;
        const template = element.attributes.template?.value;
        const inline = element.attributes.inline?.value;

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
            if (inline == "true")
                ctx.writer.write(", true");
            ctx.writer.write(")");
        }


        return HandleResult.SkipChildren;
    }

}