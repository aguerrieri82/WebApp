import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";

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