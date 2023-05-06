import type { ITemplate } from "./ITemplate";

export type CatalogTemplate<TModel> = ITemplate<TModel> | string;

export interface ITemplateProvider<TModel = any> {

    template: CatalogTemplate<TModel>;
}

export function isTemplateProvider(obj: any): obj is ITemplateProvider {

    return obj && typeof obj == "object" && "template" in obj;
}