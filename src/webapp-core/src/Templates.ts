import type { IBehavoir, ITemplate, StringLike } from "./abstraction";

export const TemplateCatalog: { [key: string]: ITemplate<unknown> } = {};

export const BehavoirCatalog: { [key: string]: () => IBehavoir } = {}

export function defineTemplate<TModel>(name: string, template: ITemplate<TModel>) {
    TemplateCatalog[name] = template;
    return template;
} 

export function defineBehavoir(name: string, factory: () => IBehavoir) {
    BehavoirCatalog[name] = factory;
}

export const TextTemplate = defineTemplate<StringLike>("Text", t => t.text(t.model));

export const ArrayTemplate = defineTemplate<any[]>("Array", t => {
    t.model?.forEach(a => t.content(a)); 
});
   