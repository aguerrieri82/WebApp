import type { TemplateContext } from "../TemplateContext";
import { ITemplateNode } from "./ITemplateNode";

export enum HandleResult {
    CompileChildren,
    SkipChildren,
    Error,
    Handled
}

export interface ITemplateHandler {

    canHandle(ctx: TemplateContext, node: ITemplateNode) : boolean;

    handle(ctx: TemplateContext, node: ITemplateNode): HandleResult;
}