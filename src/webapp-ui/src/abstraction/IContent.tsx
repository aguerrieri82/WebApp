import { type IComponent } from "@eusoft/webapp-core";
import { type IFeature } from "./IFeature";
import { type LocalString, type ViewNode } from "../Types";
import { type IAction } from "./IAction";
import { type IContentHost } from "./IContentHost";

export type LoadState = "loaded" | "loading" | "error" | undefined;

export interface IContent<TArgs extends {} = undefined> extends IComponent {

    loadAsync(host: IContentHost, args?: TArgs): Promise<boolean>;

    onOpenAsync(): Promise<unknown>;

    onCloseAsync(): Promise<unknown>;

    route: string;

    features: IFeature<this>[];

    title: LocalString;

    shortTitle: LocalString;

    icon: ViewNode;

    actions: IAction[];

    body: ViewNode;

    transition?: string;

    readonly loadState: LoadState;
}

export interface IContentInfo<
    TArgs extends {} = {},
    TContent extends IContent<TArgs> = IContent<TArgs>> {

    name: string;

    route: string;

    icon?: ViewNode;

    transition?: string;

    factory: () => TContent;
}

export interface IContentConstructor<
    TArgs extends {} = {},
    TContent extends IContent<TArgs> = IContent<TArgs>> {

    new(): TContent;

    info: IContentInfo<TArgs, TContent>;
}

export interface IContentInstance<
    TArgs extends {} = {},
    TContent extends IContent<TArgs> = IContent<TArgs>> {

    args: TArgs;

    factory: () => TContent
}

export type ContentRef<
    TArgs extends {} = {},
    TContent extends IContent<TArgs> = IContent<TArgs>> =
string |
IContentInfo<TArgs, TContent> |
IContentInstance<TArgs, TContent> |
IContentConstructor<TArgs>;


export function contentInfo<
    TArgs extends {},
    TContent extends IContent<TArgs>,
    TContentInfo extends IContentInfo<TArgs, TContent>>(info: TContentInfo): TContentInfo {

        return info;
}
