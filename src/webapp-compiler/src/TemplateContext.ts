import { strict } from "assert";
import type { ITemplateHandler } from "./Abstraction/ITemplateHandler";
import { TemplateCompiler } from "./TemplateCompiler";
import { TemplateWriter } from "./Text/TemplateWriter";
import { isLetterOrDigit } from "./TextUtils";
import { StringBuilder } from "./StringBuilder";

class StackFrame {
    builderNameJs: string;
    handler: ITemplateHandler;
    element: Node;
    parent: StackFrame;
    index: number;
    parameters: Record<string, string>;
}

export class TemplateContext {

    isElement(node: Node, elementName: string ) {
        return node.nodeType == 1 && node.nodeName.toUpperCase() == `${this.htmlNamespace}:${elementName}`.toUpperCase();
    }

    isAttr(node: Node, elementName: string) {
        return node.nodeType == 2 && node.nodeName.toUpperCase() == `${this.htmlNamespace}:${elementName}`.toUpperCase();
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
        let result = new StringBuilder();
        let name = new StringBuilder();
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

    enter(handler: ITemplateHandler, element: Node) {

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

    templates: string[] = [];

    currentFrame: StackFrame 

    writer: TemplateWriter; 

    compiler: TemplateCompiler;

    htmlNamespace: string;

    jsNamespace: string;
}