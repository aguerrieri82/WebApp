import type { ITemplateBuilder } from "./ITemplateBuilder";

export interface ITemplate<TModel> {

    (builder: ITemplateBuilder<TModel>): void;
}

export type TemplateMap<TModel> = Record<string, ITemplate<TModel>>;

export function isTemplate(obj: any): obj is ITemplate<any> {

    return obj && typeof obj == "function" && (obj as Function).length == 1;
}