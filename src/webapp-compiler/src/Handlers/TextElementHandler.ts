import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateElement, type ITemplateText, TemplateNodeType } from "../Abstraction/ITemplateNode.js";
import { type TemplateContext } from "../TemplateContext.js";
export class TextElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateElement): boolean {

        return ctx.isElement(node, "text");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        const source = element.attributes.src?.value as string;

        if (source)
            ctx.writer.write(".text(").writeBinding(source).write(")");
        else {
            const text = element.childNodes
                .filter(a => a.type == TemplateNodeType.Text)
                .map(a => (a as ITemplateText).value)
                .join("");
            ctx.writer.write(".text(").writeJson(text).write(")");
        }

        return HandleResult.SkipChildren;
    }

}