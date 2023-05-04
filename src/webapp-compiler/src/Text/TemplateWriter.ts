import { ITemplateAttribute, ITemplateElement, ITemplateNode, TemplateNodeType } from "../Abstraction/ITemplateNode";
import { IWriteable } from "../Abstraction/IWriteable";
import { HtmlCompiler } from "../HtmlCompiler";
import { JsxCompiler } from "../JsxCompiler";
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

        if (this.context.compiler instanceof JsxCompiler)
            return this.write(value);

        return this.beginInlineFunction(this.context.getParameter("$model"))
            .write(this.context.replaceExpression(value))
            .endInlineFunction();
    }

    writeExpression(value: string) {
        if (this.context.compiler instanceof JsxCompiler)
            return this.write(value);
        return this.write(value.replaceAll("$model", `${this.context.currentFrame.builderNameJs}.model`));
    }

    writeTemplate(element?: ITemplateElement) {

        if (!element)
            element = this.context.currentFrame.element;

        this.context.currentFrame.builderNameJs = "t" + this.context.currentFrame.index;
        return this.beginInlineFunction(this.context.currentFrame.builderNameJs)
            .write(this.context.currentFrame.builderNameJs) 
            .indentAdd()
            .writeLine()
            .writeChildNodes(element)
            .endInlineFunction()
            .indentSub();
    }

    writeElement(node: ITemplateNode) {
        this.context.compiler.compileElement(this.context, node);
        return this;
    }

    writeAttribute(attr: ITemplateAttribute ) {
        this.context.compiler.compileAttribute(this.context, attr);
        return this;
    }
     
    writeChildElements(node: ITemplateElement ) {
        this.context.compiler.compileElements(this.context, node.childNodes.filter(a => a.type == TemplateNodeType.Element));
        return this; 
    }

    writeChildNodes(node: ITemplateElement ) {
        this.context.compiler.compileElements(this.context, node.childNodes);
        return this;
    }

    readonly context: TemplateContext;
}