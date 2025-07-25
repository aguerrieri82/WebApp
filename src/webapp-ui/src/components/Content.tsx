﻿import { type Bindable, type IComponentOptions, Component, type TemplateMap, registerComponent, cleanProxy } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { type IContent, type IContentConstructor, type IContentInfo, type IContentInstance, type LoadState } from "../abstraction/IContent";
import { type IFeature } from "../abstraction/IFeature";
import { formatText } from "../utils/Format";
import { type LoadResult, type LocalString, type ViewNode } from "../types";
import { stringOrUndef, useOperation } from "../utils";
import { type IAction } from "../abstraction/IAction";
import { type IContentHost } from "../abstraction";
import "./Content.scss";
import { Action } from "./Action";

export interface IContentOptions<TArgs extends ObjectLike> extends IComponentOptions {

    title?: Bindable<ViewNode>;

    shortTitle?: Bindable<LocalString>;

    body?: Bindable<ViewNode>;

    icon?: ViewNode;

    actions?: Bindable<IAction[]>;

    route?: string;

    features?: IFeature<IContent, TArgs>[];
}

export const ContentTemplates: TemplateMap<Content> = {

    "Page": forModel(m => <div className={m.className}>

        <Class name="page" />

        <header>
            {m.showBack && <Action onExecuteAsync={() => m.host.closeAsync()} style="icon">❮</Action>}
            <span className="title">{formatText(m.title)}</span>
        </header>
        <div className="body">
            {m.body}
        </div>
        <footer>
            {m.actions?.forEach(a =>
                <Action
                    visible={!a.canExecute || a.canExecute({})}
                    name={a.name}
                    type={a.type}
                    target={m}
                    onExecuteAsync={a.executeAsync}>
                    {a.icon}
                    {formatText(a.text)}
                </Action>
            )}
        </footer>
    </div>)

}
export class Content<
    TArgs extends ObjectLike = ObjectLike,
    TOptions extends IContentOptions<TArgs> = IContentOptions<TArgs>,
>

    extends Component<TOptions>
    implements IContent<TArgs> {

    protected _loadState: LoadState;

    constructor(options?: TOptions) {

        super();

        const info = (this.constructor as IContentConstructor).info;

        this.init(Content, {
            template: ContentTemplates.Page,
            name: info?.name,
            features: info?.features,
            icon: info?.icon,
            ...options
        });

    }

    async loadAsync(host: IContentHost, args?: TArgs) {

        let isValid = true;

        this.host = host;

        this._loadState = "loading";

        await useOperation(async () => {

            if (!args)
                args = {} as TArgs;

            if (this.features) {

                for (const feature of this.features) {
                    if (!await feature(this, args)) {
                        isValid = false;
                        return;
                    }
                }
            }

            if (!await this.onLoadAsync(args)) {
                isValid = false;
                await this.onCloseAsync();
                return;
            }

        }, { name: "load page " + stringOrUndef(this.name) });

        if (isValid)
            this._loadState = "loaded";
        else
            this._loadState = "error";

        this.showBack = host.canGoBack;

        return isValid;
    }

    protected async onLoadAsync(args?: TArgs) {
        return true;
    }

    refreshAsync(): Promise<unknown> {

        return Promise.resolve();
    }

    async onOpenAsync(): Promise<unknown> {

        return Promise.resolve();

    }

    async onCloseAsync(): Promise<LoadResult> {

        return Promise.resolve(true);
    }

    get loadState() {
        return this._loadState;
    }

    features: IFeature<this, TArgs>[];

    title: LocalString;

    shortTitle: LocalString;

    body: ViewNode;

    route: string;

    icon: ViewNode;

    actions: IAction[];

    host: IContentHost;

    showBack: boolean;

    declare name: string;

    static info: IContentInfo;
}

export function singleton<T>(type: Class<T>) {

    let instance: T;
    return () => {
        if (!instance)
            instance = new type();
        return instance;
    }
}

export function content<
    TArgs extends {},
    TContent extends IContent<TArgs>>(
        info: IContentInfo<TArgs, TContent>,
        args: TArgs): IContentInstance<TArgs, TContent> {

    return {
        args,
        factory: info.factory,
    } as IContentInstance<TArgs, TContent>;
}

registerComponent(Content, "Content");