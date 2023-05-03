import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement, ITemplateNode } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";

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