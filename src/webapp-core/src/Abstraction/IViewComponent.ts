import type { CatalogTemplate } from "./ITemplateProvider";

export interface IViewComponent {

    template: CatalogTemplate<this>;
}