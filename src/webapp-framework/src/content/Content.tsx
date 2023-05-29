import {CatalogTemplate, ITemplate } from "@eusoft/webapp-core";
import { IAction, IContent, LocalString, ViewNode } from "@eusoft/webapp-ui";

export interface IContentOptions  {

    template?: CatalogTemplate<any>;

    name?: string;

    icon?: ViewNode;

    shortTitle?: LocalString;

    title?: LocalString;

    actions?: IAction[];
} 

export abstract class Content<TOptions extends IContentOptions> implements IContent {

    constructor() {


    }

    protected init(caller: Function, options?: TOptions) {

        if (caller == this.constructor)
            Object.assign(this, options);
    }

    name: string;

    template: ITemplate<this>;

    title: LocalString;

    shortTitle: LocalString;

    icon: ViewNode;

    actions: IAction[];
}