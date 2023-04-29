import type { ITemplateBuilder } from "./ITemplateBuilder";

export interface ITemplate<TModel> {

    (builder: ITemplateBuilder<TModel>): void;
}