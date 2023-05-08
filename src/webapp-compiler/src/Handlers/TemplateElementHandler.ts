import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement, ITemplateNode } from "../Abstraction/ITemplateNode";
import { CompilerLanguage } from "../BaseCompiler";
import { HtmlCompiler } from "../HtmlCompiler";
import { TemplateContext } from "../TemplateContext";

export class TemplateElementHandler implements ITemplateHandler {

    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "template");
    }

    handle(ctx: TemplateContext, node: ITemplateElement): HandleResult {

        var templateName = node.attributes.name?.value;
        var modelType = node.attributes.for?.value;
        var builderName = node.attributes.as?.value;

        ctx.templates.push(templateName);

        if (!modelType)
            modelType = "any";

        if (ctx.compiler instanceof HtmlCompiler) {
            ctx.writer.ensureNewLine()
                .write("export const ").write(templateName).write(" = ");
        }

        if (templateName)
            ctx.writer.write("__defineTemplate(").writeString(templateName).write(", ");

        ctx.writer.writeTemplate(undefined, builderName);

        if (templateName)
            ctx.writer.write(")");

        if (ctx.compiler instanceof HtmlCompiler)
            ctx.writer.write(";");
        
        return HandleResult.SkipChildren;
    }

}