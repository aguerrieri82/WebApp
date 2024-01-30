import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { ITemplateAttribute } from "../Abstraction/ITemplateNode.js";
import { TemplateContext } from "../TemplateContext.js";

export class OnAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateAttribute): boolean {

        return ctx.isAttr(node) && node.name.toLowerCase().startsWith(ctx.htmlNamespace + ":on-");
    }

    handle(ctx: TemplateContext, node: ITemplateAttribute): HandleResult {

        const eventName = node.name.substring(ctx.htmlNamespace.length + 4);
        ctx.writer.write(".on(").writeJson(eventName).write(", ").writeBinding(node.value as string).write(")");
        return HandleResult.Handled;
    }

}