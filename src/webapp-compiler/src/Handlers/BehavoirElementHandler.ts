import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { ITemplateElement } from "../Abstraction/ITemplateNode.js";
import { TemplateContext } from "../TemplateContext.js";

export class BehavoirElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateElement): boolean {

        return ctx.isElement(node, "behavoir");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        var className = element.attributes.class?.value as string;
        var name = element.attributes.name?.value as string;

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