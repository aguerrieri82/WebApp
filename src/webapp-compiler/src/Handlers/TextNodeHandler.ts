import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";

export default class TextNodeHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Node): boolean {

        return node.nodeType == 3;
    }

    handle(ctx: TemplateContext, element: Node): HandleResult {

        if (element.nodeValue.trim().length > 0 || ctx.compiler.options.includeWhitespace)
            ctx.writer.write(".text(").writeJson(element.nodeValue).write(")");

        return HandleResult.SkipChildren;
    }

}