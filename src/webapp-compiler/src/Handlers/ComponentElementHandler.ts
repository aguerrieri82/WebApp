import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement, ITemplateNode } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";

export class ComponentElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "component");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        const type = element.attributes[`${ctx.htmlNamespace}:type`]?.value;

        if (!type) {
            ctx.error("Type not specified in component.");
            return HandleResult.Error;
        }

        const props : Record<string, any> = {};

        for (const attr in element.attributes) {
            if (!attr.startsWith(`${ctx.htmlNamespace}:`))
                props[attr] = element.attributes[attr].value;
        }

        ctx.writer.write(".").write("component").write("(").write(type).write(",").writeObject(props).write(")");

        return HandleResult.SkipChildren;
    }

}