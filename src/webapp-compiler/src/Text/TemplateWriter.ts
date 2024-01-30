import { ITemplateAttribute, ITemplateElement, ITemplateNode, TemplateNodeType } from "../Abstraction/ITemplateNode.js";
import { IWriteable } from "../Abstraction/IWriteable.js";
import type { TemplateContext } from "../TemplateContext.js";
import { JsWriter } from "./JsWriter.js";

export class TemplateWriter extends JsWriter {
    constructor(stream: IWriteable, context: TemplateContext) {
        super(stream);
        this.context = context;
    }


    writeIdentifier(name: string ) {
        return this.write(this.context.jsNamespace).write(".").write(name);
    }

    writeJsObject(className: string) {
        return this.writeIdentifier("apply").write("(new ").write(className).write("(), ")
        .beginInlineFunction("obj")
        .beginBlock()
        .endBlock()
        .write(")")
    }

    writeBinding(value: string) {

        if (this.context.isJsx) 
            return this.write(value);
        

        return this.beginInlineFunction(this.context.getParameter("$model"))
            .write(this.context.replaceExpression(value))
            .endInlineFunction();
    }

    writeString(value: string) {
        if (this.context.isJsx) 
            return this.write(value);
        return this.writeJson(value);
    }

    writeExpression(value: string) {
        if (this.context.isJsx) 
            return this.write(value);
        return this.write(value.replaceAll("$model", `${this.context.currentFrame.builderNameJs}.model`));
    }

    writeTemplate(element?: ITemplateElement, builderNameJs?: string, includeRoot = false) {

        if (!element)
            element = this.context.currentFrame.element;

        this.context.currentFrame.builderNameJs = builderNameJs ?? "t" + this.context.currentFrame.index;

        this.beginInlineFunction(this.context.currentFrame.builderNameJs)
            .write(this.context.currentFrame.builderNameJs) 
            .indentAdd()
            .writeLine();

        if (includeRoot)
            this.writeElement(element);
        else
            this.writeChildNodes(element);

         return this.endInlineFunction()
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