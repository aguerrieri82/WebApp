import { CatalogTemplate } from "@eusoft/webapp-core";
import { LocalString, ViewNode } from "../Types";
import { IAction } from "./IAction";
import { IContentHost } from "./IContentHost";

export interface IContent<TArgs = unknown> {

    openAsync?(host: IContentHost, args?: TArgs): Promise<boolean>;

    name?: string;

    title?: LocalString;

    icon?: ViewNode;

    shortTitle?: LocalString;

    actions?: IAction[];

    template: CatalogTemplate<this>;
}