import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateAttribute } from "../Abstraction/ITemplateNode.js";
import { type TemplateContext } from "../TemplateContext.js";

export class BindingAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateAttribute): boolean {

        return ctx.isAttr(node) && node.name.toLowerCase().startsWith(ctx.htmlNamespace + ":");
    }

    handle(ctx: TemplateContext, node: ITemplateAttribute): HandleResult {

        ctx.writer.write(".set(")
            .writeJson(node.name.substring(ctx.htmlNamespace.length + 1))
            .write(",").writeBinding(node.value as string).write(")");

        return HandleResult.Handled;
    }

    readonly priority = 10;
}