import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateElement, type ITemplateNode, TemplateNodeType } from "../Abstraction/ITemplateNode.js";
import { StringBuilder } from "../StringBuilder.js";
import { type TemplateContext } from "../TemplateContext.js";
import { TemplateWriter } from "../Text/TemplateWriter.js";

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

        const oldWriter = ctx.writer;

        const props: Record<string, any> = {};

        const modes: Record<string, string> = {};

        for (const name in element.attributes) {
            if (!name.startsWith(`${ctx.htmlNamespace}:`)) {
                const attr = element.attributes[name];
                if (typeof attr.value == "string")
                    props[name] = attr.value;
                else {
                    const contentWriter = new TemplateWriter(new StringBuilder(), ctx);

                    ctx.writer = contentWriter;

                    contentWriter.beginBlock()
                        .ensureNewLine().write("model: ").write(ctx.currentFrame.builderNameJs + ".model").write(",")
                        .ensureNewLine().write("template: ").writeElement(attr.value)
                        .endBlock();

                    //contentWriter.writeElement(attr.value);

                    props[name] = contentWriter.out.toString();

                    ctx.writer = oldWriter;
                }
                if (attr.bindMode)
                    modes[name] = JSON.stringify(attr.bindMode);
            }
        }

        element.childNodes = element.childNodes.filter(a => a.type != TemplateNodeType.Text || a.value.trim().length > 0);

        if (element.childNodes.length > 0) {

            const isComponent = element.childNodes.every(a =>
                ctx.isElement(a, "component") ||
                (ctx.isElement(a) && !(a as ITemplateElement).name.toLowerCase().startsWith(ctx.htmlNamespace + ":")) ||
                a.type == TemplateNodeType.Text);

            const isSingleHtml = element.childNodes.length && 1 &&
                element.childNodes.every(a =>
                    (ctx.isElement(a) && !(a as ITemplateElement).name.toLowerCase().startsWith(ctx.htmlNamespace + ":")));

            const contentWriter = new TemplateWriter(new StringBuilder(), ctx);

            ctx.writer = contentWriter;

            if (isComponent && !isSingleHtml) {

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
                    else {
                        ctx.enter(this, element);
                        contentWriter
                            .beginBlock()
                            .ensureNewLine().write("model: ").write(ctx.currentFrame.builderNameJs + ".model").write(",")
                            .ensureNewLine().write("template: ").writeTemplate(item, undefined, true)
                            .endBlock();
                        ctx.exit();
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
                ctx.enter(this, element);
                //TODO be carefull, before was a lambda passing dynamically the model
                contentWriter
                    .beginBlock()
                    .ensureNewLine().write("model: ").write(ctx.currentFrame.builderNameJs + ".model").write(",")
                    .ensureNewLine().write("template: ").writeTemplate(element)
                    .endBlock()

                ctx.exit();
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