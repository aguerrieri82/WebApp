declare module "*.html" {
    import { ITemplate } from "@eusoft/webapp-core";

    const Template: ITemplate<any>;

    export default Template;
}