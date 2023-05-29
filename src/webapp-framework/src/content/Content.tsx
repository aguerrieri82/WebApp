import {CatalogTemplate, ITemplate } from "@eusoft/webapp-core";
import { IAction, IContent, IContentHost, LocalString, ViewNode } from "@eusoft/webapp-ui";

export interface IContentOptions<TArgs = unknown>  {

    template?: CatalogTemplate<any>;

    name?: string;

    icon?: ViewNode;

    shortTitle?: LocalString;

    title?: LocalString;

    actions?: IAction[];

    onLoadAsync?: (args: TArgs) => Promise<void>;
} 

export abstract class Content<TOptions extends IContentOptions<TArgs>, TArgs = unknown> implements IContent {

    constructor() {

    }

    protected init(caller: Function, options?: TOptions) {

        if (caller == this.constructor)
            Object.assign(this, options);
    }

    async openAsync(host: IContentHost, args?: TArgs) {

        this.host = host;

        await this.onLoadAsync(args);

        return await this.onOpenAsync(args);
    }

    protected async onOpenAsync(args?: TArgs) {

        return true;
    }

    protected async onLoadAsync(args?: TArgs) {

    }

    host: IContentHost;

    name: string;

    template: ITemplate<this>;

    title: LocalString;

    shortTitle: LocalString;

    icon: ViewNode;

    actions: IAction[];
}