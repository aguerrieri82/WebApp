import { Bindable, IComponent } from "@eusoft/webapp-core";
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

export interface IContentInfo<TArgs extends {} = {}, TContent extends IContent<TArgs> = IContent<TArgs>> {

    name: string;

    route: string;

    icon?: ViewNode;

    factory: () => TContent;
}

export interface IContentConstructor<TArgs extends {} = {}, TContent extends IContent<TArgs> = IContent<TArgs>> {

    new(): TContent;

    info: IContentInfo<TArgs, TContent>;
}

export interface IContentInstance<TArgs extends {} = {}, TContent extends IContent<TArgs> = IContent<TArgs>> {
    args: TArgs;
    factory: () => TContent
}

export type ContentRef<TArgs extends {} = {}, TContent extends IContent<TArgs> = IContent<TArgs>> = string | IContentInfo<TArgs, TContent> | IContentInstance<TArgs, TContent> | IContentConstructor<TArgs>;
