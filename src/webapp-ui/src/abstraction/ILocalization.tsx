import { IService } from "@eusoft/webapp-core";


export const LOCALIZATION: any = Symbol.for("$localization");


export interface ILocalization extends IService<typeof LOCALIZATION> {

    getString(id: string): string;

    language: string;
}