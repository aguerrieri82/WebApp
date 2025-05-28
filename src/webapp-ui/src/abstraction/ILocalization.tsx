import { type IService } from "@eusoft/webapp-core";
import { type JsxNode } from "@eusoft/webapp-jsx";


export const LOCALIZATION: any = Symbol.for("$localization");

export type LocalizationContent = string | { (args: JsxNode<any>[]): JSX.Element };

export interface ILocalization extends IService<typeof LOCALIZATION> {

    getContent(id: string): LocalizationContent;

    language: string;
}