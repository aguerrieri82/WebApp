import { HandleResult, ITemplateHandler } from "../Abstraction/ITemplateHandler";
import { TemplateContext } from "../TemplateContext";

export class ElementHandler implements ITemplateHandler {
     
    canHandle(ctx: TemplateContext, node: Node): boolean {

        return node.nodeType == 1 && !node.nodeName.toLowerCase().startsWith(ctx.htmlNamespace + ":"); 
    }

    handle(ctx: TemplateContext, node: Element): HandleResult {

        var ns = node.getAttribute("xmlns");

        if (ns == null) {
            ctx.writer.ensureNewLine()
                .write(".beginChild(").writeJson(node.nodeName).write(")").indentAdd();
        }
        else {
            ctx.writer.ensureNewLine()
                .write(".beginChild(").writeJson(node.nodeName).write(",").writeJson(ns).write(")").indentAdd();
        }
        for(const attribute of node.attributes)
            ctx.writer.writeAttribute(attribute);

        ctx.writer.writeChildNodes(node).indentSub().writeLine(".endChild()");

        return HandleResult.SkipChildren;
    }

}