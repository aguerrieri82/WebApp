import type { ITemplate } from "./ITemplate";

export type CatalogTemplate<TModel> = ITemplate<TModel> | string;

export interface ITemplateProvider {

    template: CatalogTemplate<this>;
}