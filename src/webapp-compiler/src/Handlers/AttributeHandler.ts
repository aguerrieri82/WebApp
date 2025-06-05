import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateAttribute } from "../Abstraction/ITemplateNode.js";
import { type TemplateContext } from "../TemplateContext.js";

export class AttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateAttribute): boolean {

        return ctx.isAttr(node) && !node.name.toLowerCase().startsWith(ctx.htmlNamespace + ":"); 
    }

    handle(ctx: TemplateContext, node: ITemplateAttribute): HandleResult {

        ctx.writer.write(".set(").writeJson(node.name).write(",").writeString(node.value as string).write(")");

        return HandleResult.Handled;
    }

}