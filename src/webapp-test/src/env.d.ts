import type { ITemplate } from "./Abstraction";

declare module "*.html" {
    const template: ITemplate<any>;
    export default template;
}