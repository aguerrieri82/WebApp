import { IComponent, ITemplateProvider } from "@eusoft/webapp-core";
import { IFeature } from "./IFeature";
import { LocalString, ViewNode } from "../Types";
import { IAction } from "./IAction";
import { IContentHost } from "./IContentHost";

export type LoadState = "loaded" | "loading" | "error" | undefined;


export interface IContent<TArgs extends {} = undefined> extends IComponent {

    loadAsync(host: IContentHost, args?: TArgs): Promise<boolean>;

    onOpenAsync(): Promise<any>;

    onCloseAsync(): Promise<any>;

    route: string;

    features: IFeature<this>[];

    title: LocalString;

    shortTitle: LocalString;

    icon: ViewNode;

    actions: IAction[];

    body: ViewNode;

    readonly loadState: LoadState;
}

export interface IContentInfo {

    name: string;

    route: string;

    icon?: ViewNode;

    factory: () => IContent;
}

export interface IContentConstructor {

    new(): IContent;

    info: IContentInfo;
}