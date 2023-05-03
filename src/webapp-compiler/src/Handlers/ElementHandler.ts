import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { ITemplateElement, ITemplateNode } from "../Abstraction/ITemplateNode";
import { TemplateContext } from "../TemplateContext";

export class ElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: ITemplateNode): boolean {

        return ctx.isElement(node) && !node.name.toLowerCase().startsWith(ctx.htmlNamespace + ":"); 
    }

    handle(ctx: TemplateContext, node: ITemplateElement): HandleResult {

        var ns = node.attributes.xmlns?.value;

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