import { TEMPLATE_BUILDER, type IBehavoir, type ITemplate } from "./abstraction";

export const TemplateCatalog: { [key: string]: ITemplate<unknown> } = {};
export const BehavoirCatalog: { [key: string]: () => IBehavoir } = {}

export function template<TModel, TTemplate extends ITemplate<TModel> = ITemplate<TModel>>(template: TTemplate, name?: string): TTemplate {
    template[TEMPLATE_BUILDER] = true;
    if (name)
        TemplateCatalog[name] = template;
    return template;
}

export const TextTemplate = template<StringLike>(t => t.text(t.model), "Text");

export const ArrayTemplate = template<any[]>(t => {
    t.model?.forEach(a => t.content(a)); 
}, "Array");
