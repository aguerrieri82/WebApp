import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";

export class AttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Attr): boolean {

        return node.nodeType == 2 && !node.nodeName.toLowerCase().startsWith(ctx.htmlNamespace + ":"); 
    }

    handle(ctx: TemplateContext, node: Attr): HandleResult {

        ctx.writer.write(".set(").writeJson(node.name).write(",").writeJson(node.value).write(")");

        return HandleResult.Handled;
    }

}