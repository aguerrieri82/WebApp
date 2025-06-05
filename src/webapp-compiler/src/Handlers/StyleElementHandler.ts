import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateElement } from "../Abstraction/ITemplateNode.js";
import { type TemplateContext } from "../TemplateContext.js";

export class StyleElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateElement): boolean {

        return ctx.isElement(node, "style")
    }

    handle(ctx: TemplateContext, node: ITemplateElement): HandleResult {

        for (const attr in node.attributes) 
            ctx.writer.write(".style(").writeJson(attr).write(", ").writeBinding(node.attributes[attr].value as string).write(")");
        
        return HandleResult.SkipChildren;
    }

}