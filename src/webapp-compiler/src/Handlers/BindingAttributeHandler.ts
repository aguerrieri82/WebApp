import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";


export default class BindingAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Attr): boolean {

        return node.nodeType == 2 && node.nodeName.toLowerCase().startsWith(ctx.htmlNamespace + ":") &&
              !node.nodeName.toLowerCase().startsWith(ctx.htmlNamespace + ":set-");
    }

    handle(ctx: TemplateContext, node: Attr): HandleResult {

        ctx.writer.write(".set(")
            .writeJson(node.nodeName.substring(ctx.htmlNamespace.length + 1))
            .write(",").writeBinding(node.value).write(")");

        return HandleResult.Handled;
    }

}