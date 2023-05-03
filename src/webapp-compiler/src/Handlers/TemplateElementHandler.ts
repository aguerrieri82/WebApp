import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { CompilerLanguage } from "../BaseCompiler";
import { TemplateContext } from "../TemplateContext";

export default class TemplateElementHandler implements ITemplateHandler {

    canHandle(ctx: TemplateContext, node: Node): boolean {

        return ctx.isElement(node, "template");
    }

    handle(ctx: TemplateContext, node: Element): HandleResult {

        var templateName = node.getAttribute("name");
        var modelType = node.getAttribute("for");
        var modelName = node.getAttribute("as");

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

        if (ctx.compiler.options.language == TemplateLanguage.Javascript)
            ctx.writer.write(");");

        return HandleResult.SkipChildren;
    }

}