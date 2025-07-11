import { type IComponent } from "@eusoft/webapp-core";
import { type IFeature } from "./IFeature";
import { type LoadResult, type LocalString, type ViewNode } from "../types";
import { type IAction } from "./IAction";
import { type IContentHost } from "./IContentHost";

export type LoadState = "loaded" | "loading" | "error" | undefined;

export interface IContent<TArgs extends ObjectLike = undefined> extends IComponent {

    loadAsync(host: IContentHost, args?: TArgs): Promise<LoadResult>;

    onOpenAsync(): Promise<unknown>;

    onCloseAsync(): Promise<LoadResult>;

    refreshAsync?(): Promise<unknown>;

    route: string;

    features: IFeature<this>[];

    title: LocalString;

    shortTitle: LocalString;

    icon: ViewNode;

    actions: IAction[];

    body: ViewNode;

    transition?: string;

    host: IContentHost;

    readonly loadState: LoadState;
}

export interface IContentInfo<
    TArgs extends ObjectLike = ObjectLike,
    TContent extends IContent<TArgs> = IContent<TArgs>> {

    name: string;

    route: string;

    icon?: ViewNode;

    transition?: "push" |"reload"|"pop"|undefined;

    features?: IFeature<TContent>[];

    factory: () => TContent;
}

export interface IContentConstructor<
    TArgs extends ObjectLike = ObjectLike,
    TContent extends IContent<TArgs> = IContent<TArgs>> {

    new(): TContent;

    info: IContentInfo<TArgs, TContent>;
}

export interface IContentInstance<
    TArgs extends ObjectLike = ObjectLike,
    TContent extends IContent<TArgs> = IContent<TArgs>> {

    args: TArgs;
    route?: string;
    factory: () => TContent
}

export type ContentRef<
    TArgs extends ObjectLike = ObjectLike,
    TContent extends IContent<TArgs> = IContent<TArgs>> =
string |
IContentInfo<TArgs, TContent> |
IContentInstance<TArgs, TContent> |
IContentConstructor<TArgs>;

export function contentInfo<
    TArgs extends ObjectLike,
    TContent extends IContent<TArgs>,
    TContentInfo extends IContentInfo<TArgs, TContent>>(info: TContentInfo): TContentInfo {

        return info;
}
