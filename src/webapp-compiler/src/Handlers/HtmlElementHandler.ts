import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateElement, type ITemplateNode } from "../Abstraction/ITemplateNode.js";
import { type TemplateContext } from "../TemplateContext.js";

export class HtmlElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "html");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        //TODO innerHTML?

        //ctx.writer.write(".html(").writeJson(element.innerHTML).write(")");
        return HandleResult.SkipChildren;
    }

}