import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement, ITemplateNode } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";

export class IfElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "if");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        let condition = element.attributes.condition?.value as string;
        const has = element.attributes.has?.value as string;

        if ((!has && !condition) ||
            (has && condition)) {
            ctx.error("If must specify either has or condition.");
            return HandleResult.Error;
        }

        if (has)
            condition = has + " != null";

        const elseIndex = element.childNodes?.findIndex(a => ctx.isElement(a, "else"));

        let elseBlock: ITemplateElement;

        if (elseIndex != -1)
            elseBlock = element.childNodes.splice(elseIndex, 1)[0] as ITemplateElement;

        ctx.writer.ensureNewLine().write(".if(")
            .writeBinding(condition)
            .write(", ")
            .writeTemplate();

        if (elseBlock != null)
            ctx.writer.write(", ").writeTemplate(elseBlock);

        ctx.writer.ensureNewLine().writeLine(")");

        return HandleResult.SkipChildren;
    }

}