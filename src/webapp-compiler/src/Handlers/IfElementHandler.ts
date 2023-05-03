import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";

export class IfElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Node): boolean {

        return ctx.isElement(node, "if");
    }

    handle(ctx: TemplateContext, element: Element): HandleResult {

        let condition = element.getAttribute("condition");
        const has = element.getAttribute("has");

        if ((!has && !condition) ||
            (has && condition)) {
            ctx.error("Just must specify either has or condition.");
            return HandleResult.Error;
        }

        if (has)
            condition = has + " != null";

        const elseBlock = element.querySelector(`${ctx.htmlNamespace}\\:else`);

        if (elseBlock != null)
            elseBlock.remove();

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