import { CatalogTemplate } from "@eusoft/webapp-core";
import { LocalString, ViewNode } from "../Types";
import { IAction } from "./IAction";

export interface IContent {

    name?: string;

    title?: LocalString;

    icon?: ViewNode;

    shortTitle?: LocalString;

    actions?: IAction[];

    template: CatalogTemplate<this>;
}