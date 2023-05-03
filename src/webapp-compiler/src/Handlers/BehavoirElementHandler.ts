import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";

export class BehavoirElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Node): boolean {

        return ctx.isElement(node, "behavoir");
    }

    handle(ctx: TemplateContext, element: Element): HandleResult {

        var className = element.getAttribute("class");
        var name = element.getAttribute("name");

        if ((name && className) ||
            (!name && !className)) {
            ctx.error("Just must specify either name or class.");
            return HandleResult.Error;
        }

        if (className) {
            ctx.writer.write(".behavoir(").writeJsObject(className).write(")");
        }
        else
            ctx.writer.write(".behavoir(").writeJson(name).write(")");

        return HandleResult.SkipChildren;
    }

}