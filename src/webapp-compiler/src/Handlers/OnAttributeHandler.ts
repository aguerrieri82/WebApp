import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";

export default class OnAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Attr): boolean {

        return node.nodeType == 2 && node.name.toLowerCase().startsWith(ctx.htmlNamespace + ":on-");
    }

    handle(ctx: TemplateContext, node: Attr): HandleResult {

        const eventName = node.name.substring(ctx.htmlNamespace.length + 4);
        ctx.writer.write(".on(").writeJson(eventName).write(", ").writeBinding(node.value).write(")");
        return HandleResult.Handled;
    }

}