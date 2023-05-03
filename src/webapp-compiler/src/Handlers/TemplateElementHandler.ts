import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement, ITemplateNode } from "../Abstraction/ITemplateNode";
import { CompilerLanguage } from "../BaseCompiler";
import { TemplateContext } from "../TemplateContext";

export class TemplateElementHandler implements ITemplateHandler {

    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "template");
    }

    handle(ctx: TemplateContext, node: ITemplateElement): HandleResult {

        var templateName = node.attributes.name?.value;
        var modelType = node.attributes.for?.value;
        var modelName = node.attributes.as?.value;

        ctx.templates.push(templateName);

        if (!modelType)
            modelType = "any";

        if (!templateName) {
            ctx.error("Missing template name.");
            return HandleResult.Error;
        }

        if (modelName)
            ctx.setParameter("$" + modelName, `${ctx.currentFrame.builderNameJs}.model`);

        ctx.writer.ensureNewLine();
        if (ctx.compiler.options.language == CompilerLanguage.Javascript)
            ctx.writer.write("export const ").write(templateName).write(" = ").write("__defineTemplate(").writeJson(templateName).write(", ");
        else
            ctx.writer.write(ctx.jsNamespace).write(".templateCatalog[").writeJson(templateName).write("] = ");

        ctx.writer.beginInlineFunction(ctx.currentFrame.builderNameJs)
            .beginBlock().write(" ").write(ctx.currentFrame.builderNameJs).writeLine()
            .writeChildElements(node)
            .endBlock();

        if (ctx.compiler.options.language == CompilerLanguage.Javascript)
            ctx.writer.write(");");

        return HandleResult.SkipChildren;
    }

}