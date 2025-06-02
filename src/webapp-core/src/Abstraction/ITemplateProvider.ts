import type { ITemplate } from "./ITemplate";

export type CatalogTemplate<TModel> = ITemplate<TModel> | string;

export interface ITemplateProvider<TModel = any> {

    model?: TModel;

    template: CatalogTemplate<TModel>;
}

export function isTemplateProvider(obj: unknown): obj is ITemplateProvider {

    return obj && typeof obj == "object" && "template" in obj;
}