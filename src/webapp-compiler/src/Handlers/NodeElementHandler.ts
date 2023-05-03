import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";

export class NodeElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Node): boolean {

        return ctx.isElement(node, "node");
    }

    handle(ctx: TemplateContext, element: Element): HandleResult {

        const source = element.getAttribute("src");

        if (!source) {
            ctx.error("Source not specified in node.");
            return HandleResult.Error;
        }

        ctx.writer.write(".appendChild(").writeExpression(source).write(")");

        return HandleResult.SkipChildren;
    }

}