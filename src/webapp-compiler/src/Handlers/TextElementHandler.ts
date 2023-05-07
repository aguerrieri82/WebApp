import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement, ITemplateText, TemplateNodeType } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";
export class TextElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateElement): boolean {

        return ctx.isElement(node, "text");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        const source = element.attributes.src?.value;

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