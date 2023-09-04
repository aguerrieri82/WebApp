import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement, ITemplateNode } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";

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