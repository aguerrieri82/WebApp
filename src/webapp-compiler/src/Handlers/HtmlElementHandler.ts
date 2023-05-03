import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";

export class BehavoirElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Node): boolean {

        return ctx.isElement(node, "html");
    }

    handle(ctx: TemplateContext, element: Element): HandleResult {

        ctx.writer.write(".html(").writeJson(element.innerHTML).write(")");
        return HandleResult.SkipChildren;
    }

}