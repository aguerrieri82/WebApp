import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { BindMode, ITemplateElement, ITemplateNode } from "../Abstraction/ITemplateNode";
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

        const props: Record<string, any> = {};

        const modes: Record<string, string> = {};

        for (const name in element.attributes) {
            if (!name.startsWith(`${ctx.htmlNamespace}:`)) {
                const attr = element.attributes[name];
                props[name] = attr.value;
                if (attr.bindMode)
                    modes[name] = JSON.stringify(attr.bindMode);
            }
 
        }

        ctx.writer.ensureNewLine().write(".").write("component").write("(")
            .write(type).write(",")
            .writeObject(props).write(",")
            .writeObject(modes).write(")");

        return HandleResult.SkipChildren;
    }

}