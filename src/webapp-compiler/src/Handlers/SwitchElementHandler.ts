import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { ITemplateElement, ITemplateNode } from "../Abstraction/ITemplateNode.js";
import { TemplateContext } from "../TemplateContext.js";

export class SwitchElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "switch");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        const src = element.attributes.src?.value as string;
        const builderName = element.attributes.as?.value as string;

        if (element.childNodes.some(a => !ctx.isElement(a, "when") && !ctx.isElement(a, "default"))) {
            ctx.error("Switch can have only 'When' and 'Default' as child elements");
            return HandleResult.Error;
        }

        ctx.writer.ensureNewLine().write(".switch(")
            .writeBinding(src)
            .write(", ")
            .beginInlineFunction("bld")
            .write("bld")
            .indentAdd();

        for (const child of element.childNodes) {

            ctx.writer.ensureNewLine();
     

            if (ctx.isElement(child, "when")) {
                ctx.writer.write(".when(")
                    .writeBinding(child.attributes.condition.value as string)
                    .write(", ");
            }
            else if (ctx.isElement(child, "default"))
                ctx.writer.write(".default(");

            ctx.writer.writeTemplate(child as ITemplateElement, builderName)
                      .write(")");
        }

        ctx.writer
            .endInlineFunction()
            .indentSub()
            .ensureNewLine()
            .write(")")

        return HandleResult.SkipChildren;
    }

}