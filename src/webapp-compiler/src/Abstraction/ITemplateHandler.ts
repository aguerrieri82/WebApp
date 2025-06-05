import type { TemplateContext } from "../TemplateContext.js";
import { type ITemplateNode } from "./ITemplateNode.js";

export enum HandleResult {
    CompileChildren,
    SkipChildren,
    Error,
    Handled
}

export interface ITemplateHandler {

    canHandle(ctx: TemplateContext, node: ITemplateNode) : boolean;

    handle(ctx: TemplateContext, node: ITemplateNode): HandleResult;

    readonly priority?: number;
}