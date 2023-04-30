import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";

const validFunctions = [
    "class",
    "value",
    "text",
    "focus",
    "html",
    "visible"
]

export default class FuncAttributeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Attr): boolean {

        if (node.nodeType == 2 && node.nodeName.toLowerCase().startsWith(ctx.htmlNamespace + ":")) {
            const funcName = node.nodeName.substring(ctx.htmlNamespace.length + 1);
            return validFunctions.indexOf(funcName) != -1;
        }
        return false;
    }

    handle(ctx: TemplateContext, node: Attr): HandleResult {

        const funcName = node.nodeName.substring(ctx.htmlNamespace.length + 1);

        ctx.writer.write(".").write(funcName).write("(").writeBinding(node.value).write(")");

        return HandleResult.Handled;
    }

}