import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";

export class ClassElementHandler implements ITemplateHandler {

    canHandle(ctx: TemplateContext, node: Element): boolean {

        return ctx.isElement(node, "class");
    }

    handle(ctx: TemplateContext, element: Element): HandleResult {

        const condition = element.getAttribute("condition");
        const name = element.getAttribute("name");
        if (!name) {
            ctx.error("Name not specified in class.");
            return HandleResult.Error;
        }

        if (condition)
            ctx.writer.write(".class(").writeJson(name).write(", ").writeBinding(condition).write(")");
        else
            ctx.writer.write(".class(").writeBinding(name).write(")");

        return HandleResult.SkipChildren;
    }

}