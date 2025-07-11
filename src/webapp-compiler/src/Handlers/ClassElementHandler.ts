﻿import { HandleResult, type ITemplateHandler } from "../Abstraction/ITemplateHandler.js";
import { type ITemplateElement } from "../Abstraction/ITemplateNode.js";
import { type TemplateContext } from "../TemplateContext.js";

export class ClassElementHandler implements ITemplateHandler {

    canHandle(ctx: TemplateContext, node: ITemplateElement): boolean {

        return ctx.isElement(node, "class");
    }

    handle(ctx: TemplateContext, element: ITemplateElement): HandleResult {

        const condition = element.attributes.condition?.value as string;
        const name = element.attributes.name?.value as string;

        if (!name) {
            ctx.error("Name not specified in class.");
            return HandleResult.Error;
        }

        if (condition)
            ctx.writer.write(".class(").writeString(name).write(", ").writeBinding(condition).write(")");
        else
            ctx.writer.write(".class(").writeBinding(name).write(")");

        return HandleResult.SkipChildren;
    }

}