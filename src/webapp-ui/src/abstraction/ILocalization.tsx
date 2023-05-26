import { IService } from "@eusoft/webapp-core";
import { ViewNode } from "../Types";
import { JsxNode } from "@eusoft/webapp-jsx";


export const LOCALIZATION: any = Symbol.for("$localization");

export type LocalizationContent = string | { (args: JsxNode<any>[]): ViewNode };

export interface ILocalization extends IService<typeof LOCALIZATION> {

    getContent(id: string): LocalizationContent;

    language: string;
}