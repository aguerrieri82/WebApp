import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateElement, type ITemplateNode } from "../Abstraction/ITemplateNode.js";
import { HtmlCompiler } from "../HtmlCompiler.js";
import { type TemplateContext } from "../TemplateContext.js";

export class TemplateElementHandler implements ITemplateHandler {

    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "template");
    }

    handle(ctx: TemplateContext, node: ITemplateElement): HandleResult {

        const templateName = node.attributes.name?.value as string;
        let modelType = node.attributes.for?.value as string;
        const builderName = node.attributes.as?.value as string;

        ctx.templates.push(templateName);

        if (!modelType)
            modelType = "any";

        if (ctx.compiler instanceof HtmlCompiler) {
            ctx.writer.ensureNewLine()
                .write("export const ").write(templateName).write(" = ");
        }

        ctx.writer.write("template(")
            .writeTemplate(undefined, builderName);

        if (templateName) {
            ctx.writer.write(", ")
                .writeString(templateName)

        }

        ctx.writer.write(")")

        if (ctx.compiler instanceof HtmlCompiler)
            ctx.writer.write(";");

        return HandleResult.SkipChildren;
    }

}