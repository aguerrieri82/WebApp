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

        return node.nodeType == 2 && node.nodeName.toLowerCase().startsWith(ctx.htmlNamespace + ":");
    }

    handle(ctx: TemplateContext, node: Attr): HandleResult {

        const funcName = node.nodeName.substring(ctx.htmlNamespace.length + 1);
        if (validFunctions.indexOf(funcName) == -1) {
            ctx.error(`${funcName} function not valid.`);
            return HandleResult.Error;
        }

        ctx.writer.write(".").write(funcName).write("(").writeBinding(node.value).write(")");

        return HandleResult.Handled;
    }

}