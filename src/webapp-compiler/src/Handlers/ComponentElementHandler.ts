import { it } from "node:test";
import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { BindMode, ITemplateElement, ITemplateNode, TemplateNodeType } from "../Abstraction/ITemplateNode";
import { StringBuilder } from "../StringBuilder";
import { TemplateContext } from "../TemplateContext";
import { TemplateWriter } from "../Text/TemplateWriter";

export class ComponentElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node, "component");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        const type = element.attributes[`${ctx.htmlNamespace}:type`]?.value;

        const isCreate = element.attributes[`${ctx.htmlNamespace}:create`]?.value == "true";

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

        element.childNodes = element.childNodes.filter(a => a.type != TemplateNodeType.Text || a.value.trim().length > 0);

        if (element.childNodes.length > 0) {

            const isComponent = element.childNodes.every(a =>
                ctx.isElement(a, "component") ||
                a.type == TemplateNodeType.Text);

            const oldWriter = ctx.writer;
      
            const contentWriter = new TemplateWriter(new StringBuilder(), ctx);

            ctx.writer = contentWriter;

            if (isComponent) {

                if (element.childNodes.length > 1) 
                    contentWriter.write("[");
                

                element.childNodes.forEach((item, i) => {

                    if (i > 0)
                        contentWriter.write(",");

                    if (item.type == TemplateNodeType.Text)
                        contentWriter.writeJson(item.value.trim());

                    else if (ctx.isElement(item, "component")) {

                        const createAttr = `${ctx.htmlNamespace}:create`;
                        item.attributes[createAttr] = {
                            name: createAttr,
                            type: TemplateNodeType.Attribute,
                            owner: item,
                            value: "true"
                        }
                        contentWriter.writeElement(item);
                    }
                });

                if (element.childNodes.length > 1) 
                    contentWriter.write("]");
                
            }
            else if (element.childNodes.length == 1 && ctx.isElement(element.childNodes[0], "content")) {

                contentWriter.write(element.childNodes[0].attributes["src"].value);
            }
            else
            {
                const model = "m" + ctx.currentFrame.index;

                contentWriter.beginInlineFunction(model)
                    .write("(")
                    .beginBlock()
                    .ensureNewLine().write("model: ").write(model).write(",")
                    .ensureNewLine().write("template: ").writeTemplate(element)
                    .endBlock()
                    .write(")")
                    .endInlineFunction()
            }

            props["content"] = contentWriter.out.toString();

            ctx.writer = oldWriter;
        }

        let funcName: string;

        if (isCreate) {
            funcName = "componentContent";
            ctx.writer.write(ctx.currentFrame.builderNameJs);
        }
        else {
            funcName = "component";
            ctx.writer.ensureNewLine();
        }

        ctx.writer.write(".").write(funcName).write("(")
            .write(type).write(", ")
            .writeObject(props);

        if (Object.keys(modes).length > 0)
            ctx.writer.write(", ").writeObject(modes);

        ctx.writer.write(")");

        return HandleResult.SkipChildren;
    }

}