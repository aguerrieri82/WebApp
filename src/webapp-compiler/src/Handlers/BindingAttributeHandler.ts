import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateAttribute } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";


export class BindingAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateAttribute): boolean {

        return ctx.isAttr(node) && node.name.toLowerCase().startsWith(ctx.htmlNamespace + ":");
    }

    handle(ctx: TemplateContext, node: ITemplateAttribute): HandleResult {

        ctx.writer.write(".set(")
            .writeJson(node.name.substring(ctx.htmlNamespace.length + 1))
            .write(",").writeBinding(node.value).write(")");

        return HandleResult.Handled;
    }

    readonly priority = 10;
}