import type { ITemplateBuilder } from "./ITemplateBuilder";

export interface ITemplate<TModel> {

    (builder: ITemplateBuilder<TModel>): void;
}

export type TemplateMap<TModel> = Record<string, ITemplate<TModel>>;