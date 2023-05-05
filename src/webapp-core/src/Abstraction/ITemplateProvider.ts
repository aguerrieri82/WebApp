import type { ITemplate } from "./ITemplate";

export type CatalogTemplate<TModel> = ITemplate<TModel> | string;

export interface ITemplateProvider<TModel = any> {

    template: CatalogTemplate<TModel>;
}