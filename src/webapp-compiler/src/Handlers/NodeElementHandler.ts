import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateElement, type ITemplateNode } from "../Abstraction/ITemplateNode.js";
import { type TemplateContext } from "../TemplateContext.js";

export class NodeElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "node");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        const source = element.attributes.src?.value as string;

        if (!source) {
            ctx.error("Source not specified in node.");
            return HandleResult.Error;
        }

        ctx.writer.write(".appendChild(").writeExpression(source).write(")");

        return HandleResult.SkipChildren;
    }

}