import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateAttribute } from "../Abstraction/ITemplateNode";
import { FuncAttributes } from "../Consts";
import { TemplateContext } from "../TemplateContext";

export class FuncAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateAttribute): boolean {

        if (ctx.isAttr(node) && node.name.toLowerCase().startsWith(ctx.htmlNamespace + ":")) {
            const funcName = node.name.substring(ctx.htmlNamespace.length + 1);
            return FuncAttributes.indexOf(funcName) != -1;
        }
        return false;
    }

    handle(ctx: TemplateContext, node: ITemplateAttribute): HandleResult {

        const funcName = node.name.substring(ctx.htmlNamespace.length + 1);

        ctx.writer.write(".").write(funcName).write("(").writeBinding(node.value).write(")");

        return HandleResult.Handled;
    }

}