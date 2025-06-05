import type { ITemplateHandler } from "./Abstraction/ITemplateHandler.js";
import { type TemplateWriter } from "./Text/TemplateWriter.js";
import { isLetterOrDigit } from "./TextUtils.js";
import { StringBuilder } from "./StringBuilder.js";
import { type BaseCompiler } from "./BaseCompiler.js";
import { type ITemplateAttribute, type ITemplateElement, type ITemplateNode, TemplateNodeType } from "./Abstraction/ITemplateNode.js";

class StackFrame {
    builderNameJs: string;
    handler: ITemplateHandler;
    element: ITemplateElement;
    parent: StackFrame;
    index: number;
    parameters: Record<string, string>;
}

export class TemplateContext {

    isElement(node: ITemplateNode, elementName?: string): node is ITemplateElement {

        if (node.type != TemplateNodeType.Element)
            return false;

        if (elementName)
            return (node as ITemplateElement).name.toUpperCase() == `${this.htmlNamespace}:${elementName}`.toUpperCase();

        return true;
    }

    attrValue(element: ITemplateElement, name: string, isTemp = true) {
        if (isTemp)
            name = `${this.htmlNamespace}:${name}`;
        if (name in element.attributes)
            return element.attributes[name].value;
    }

    isAttr(node: ITemplateNode): node is ITemplateAttribute;

    isAttr(node: ITemplateNode, elementName: string): boolean;

    isAttr(node: ITemplateNode, elementName?: string) {

        if (node.type != TemplateNodeType.Attribute)
            return false;

        if (elementName)
            return (node as ITemplateAttribute).name.toUpperCase() == `${this.htmlNamespace}:${elementName}`.toUpperCase();

        return true;
    }

    error(text: string) {
        this.compiler.error(text);
    }

    setParameter(htmlName: string, jsName: string ) {
        if (!this.currentFrame.parameters)
            this.currentFrame.parameters = {};
        this.currentFrame.parameters[htmlName] = jsName;
    }

    getParameter(htmlName: string) {

        for (const frame of this.stack())
        {
            if (frame.parameters && htmlName in frame.parameters)
                return frame.parameters[htmlName];
        }
    }

    replaceExpression(value: string): string {

        let state = 0;
        const result = new StringBuilder();
        const name = new StringBuilder();
        let isReplaced = false;

        for (let i = 0; i <= value.length; i++) {

            const c = i == value.length ? "\0" : value[i];

            switch (state) {
                case 0:
                    if (c == '$') {
                        state = 1;
                        name.clear();
                        name.append(c);
                    }
                    else if (c == '"') {
                        result.append(c);
                        state = 2;
                    }
                    else if (c != "\0")
                        result.append(c);
                    break;
                case 1:
  
                    if (isLetterOrDigit(c) || c == '_')
                        name.append(c);
                    else {
                        const paramName = name.toString();
                        const paramValue = this.getParameter(paramName);
                        if (!paramValue)
                            this.error(`Parameter ${paramName} not valid in this context.`);
                        else {
                            result.append(paramValue);
                            isReplaced = true;
                        }

                        if (c != '\0') 
                            result.append(c);
                        state = 0;
                    }
                    break;
                case 2:
                    result.append(c);
                    if (c == '"')
                        state = 0;
                    else if (c == '\\')
                        state = 3;
                    break;
                case 3:
                    result.append(c);
                    state = 2;
                    break;
            }
        }

        if (isReplaced)
            return this.replaceExpression(result.toString());

        return result.toString();
    }

    *stack() {

        let curItem = this.currentFrame;

        while (curItem != null) {
            yield curItem;
            curItem = curItem.parent;
        }
    }

    enter(handler: ITemplateHandler, element: ITemplateElement) {

        const newEntry = new StackFrame();
        newEntry.parent = this.currentFrame;
        newEntry.handler = handler;
        newEntry.element = element;
        if (this.currentFrame) {
            newEntry.index = this.currentFrame.index + 1;
            newEntry.builderNameJs = this.currentFrame.builderNameJs;
        }
        else {
            newEntry.parameters = {};
            newEntry.parameters["$model"] = "m";
            newEntry.parameters["$parent"] = "m[PARENT]";
            newEntry.index = 0;
            newEntry.builderNameJs = "t";
        }

        this.currentFrame = newEntry;
        return newEntry;
    }

    exit() {
        if (!this.currentFrame)
            throw new Error("Stack is empty");
        this.currentFrame = this.currentFrame.parent;
    }

    get isJsx() {
        return this.compiler.type == "Jsx";
    }

    templates: string[] = [];

    currentFrame: StackFrame 

    writer: TemplateWriter; 

    compiler: BaseCompiler;

    htmlNamespace: string;

    jsNamespace: string;
}