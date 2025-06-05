import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateElement, type ITemplateNode } from "../Abstraction/ITemplateNode.js";
import { type TemplateContext } from "../TemplateContext.js";

export class ElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node) && !node.name.toLowerCase().startsWith(ctx.htmlNamespace + ":"); 
    }

    handle(ctx: TemplateContext, node: ITemplateElement): HandleResult {

        const ns = node.attributes.xmlns?.value;

        if (ns == null) {
            ctx.writer.ensureNewLine()
                .write(".beginChild(").writeJson(node.name).write(")").indentAdd();
        }
        else {
            ctx.writer.ensureNewLine()
                .write(".beginChild(").writeJson(node.name).write(",").writeJson(ns).write(")").indentAdd();
        }

        for (const attrName in node.attributes)
            ctx.writer.writeAttribute(node.attributes[attrName]);

        ctx.writer.writeChildNodes(node).indentSub().writeLine(".endChild()");

        return HandleResult.SkipChildren;
    }

}