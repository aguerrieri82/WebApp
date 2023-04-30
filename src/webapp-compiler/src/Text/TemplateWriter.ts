import { IWriteable } from "../Abstraction/IWriteable";
import type { TemplateContext } from "../TemplateContext";
import { JsWriter } from "./JsWriter";

export class TemplateWriter extends JsWriter {
    constructor(stream: IWriteable, context: TemplateContext) {
        super(stream);
        this.context = context;
    }

    writeIdentifier(name: string ) {
        return this.write(this.context.jsNamespace).write(".").write(name);
    }

    writeJsObject(className: string) {
        return this.writeIdentifier("apply(").write("new ").write(className).write("(), ")
        .beginInlineFunction("obj")
        .beginBlock()
        .endBlock()
        .write(")")
    }

    writeBinding(value: string) {
        return this.beginInlineFunction(this.context.getParameter("$model"))
            .write(this.context.replaceExpression(value))
            .endInlineFunction();
    }

    writeExpression(value: string) {
        return this.write(value.replaceAll("$model", `${this.context.currentFrame.builderNameJs}.model`));
    }

    writeTemplate(element?: Node) {
        if (!element)
            element = this.context.currentFrame.element;

        this.context.setParameter("$parent", `${(!this.context.jsNamespace ? "" : this.context.jsNamespace + ".")}injectProxy($model, "$parent", ${this.context.currentFrame.builderNameJs}.model)`);
        this.context.currentFrame.builderNameJs = "t" + this.context.currentFrame.index;
        return this.beginInlineFunction(this.context.currentFrame.builderNameJs)
            .write(this.context.currentFrame.builderNameJs)
            .indentAdd()
            .writeLine()
            .writeChildNodes(element)
            .endInlineFunction()
            .indentSub();
    }

    writeElement(node: Node) {
        this.context.compiler.compileElement(this.context, node);
        return this;
    }

    writeAttribute(attr: Attr ) {
        this.context.compiler.compileAttribute(this.context, attr);
        return this;
    }
     
    writeChildElements(node: Node ) {
        this.context.compiler.compileElements(this.context, Array.from(node.childNodes).filter(a => a.nodeType == 1));
        return this; 
    }

    writeChildNodes(node: Node ) {
        this.context.compiler.compileElements(this.context, Array.from(node.childNodes));
        return this;
    }

    readonly context: TemplateContext;
}