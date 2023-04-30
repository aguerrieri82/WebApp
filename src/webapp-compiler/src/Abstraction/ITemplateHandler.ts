import type { TemplateContext } from "../TemplateContext";

export enum HandleResult {
    CompileChildren,
    SkipChildren,
    Error,
    Handled
}

export interface ITemplateHandler {

    canHandle(ctx: TemplateContext, node: Node) : boolean;

    handle(ctx: TemplateContext, node: Node): HandleResult;
}