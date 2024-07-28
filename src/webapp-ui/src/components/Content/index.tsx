import { Bindable, IComponentOptions, Component, TemplateMap } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { IContent, IContentConstructor, IContentInfo, IContentInstance, LoadState } from "../../abstraction/IContent";
import { IFeature } from "../../abstraction/IFeature";
import { formatText } from "../../utils/Format";
import { LocalString, ViewNode } from "../../Types";
import { stringOrUndef, useOperation } from "../../utils";
import { IAction } from "../../abstraction/IAction";
import { IContentHost } from "../../abstraction";
import "./index.scss";
import { Action } from "../Action";
export interface IContentOptions<TArgs extends {}> extends IComponentOptions {

    title?: Bindable<LocalString>;

    shortTitle?: Bindable<LocalString>;

    body?: Bindable<ViewNode>;

    icon?: ViewNode;

    actions?: Bindable<IAction[]>;

    route?: string;

    features?: IFeature<IContent>[];

    onLoadArgsAsync?: (args: TArgs) => Promise<any>;
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
                <Action name={a.name} type={a.type} onExecuteAsync={a.executeAsync}>
                    {a.icon}
                    {formatText(a.text)}
                </Action>
            )}
        </footer>
    </div>)

}			
export class Content<TArgs extends {} = unknown, TOptions extends IContentOptions<TArgs> = IContentOptions<TArgs>> extends Component<TOptions> implements IContent<TArgs> {

    protected _loadState: LoadState;

    constructor(options?: TOptions) {

        super();

        this.init(Content, {
            template: ContentTemplates.Page,
            name: (this.constructor as IContentConstructor).info?.name,
            ...options
        });
    }

    async loadAsync(host: IContentHost, args?: TArgs)  {

        let isValid = true;

        this.host = host;

        this.showBack = host.canGoBack;

        this._loadState = "loading";

        await useOperation(async () => {

            if (!args)
                args = {} as TArgs;

            await this.onLoadArgsAsync(args);

            await this.onLoadAsync(args);

            if (this.features) {

                for (const feature of this.features)
                    if (!await feature(this)) {
                        isValid = false;
                        break;
                    }
            }
        }, { name: "load page " + stringOrUndef(this.name) });

        if (isValid)
            this._loadState = "loaded";
        else
            this._loadState = "error";

        return isValid; 
    }

    protected async onLoadAsync(args?: TArgs) {


    }

    protected async onLoadArgsAsync(args?: TArgs) {


    }


    async onOpenAsync(): Promise<any> {

        
    }

    async onCloseAsync(): Promise<any> {

    }

    get loadState() {
        return this._loadState;
    }


    features: IFeature<this>[];

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

export function content<TArgs extends {}, TContent extends IContent<TArgs>>(info: IContentInfo<TArgs, TContent>, args: TArgs) : IContentInstance<TArgs, TContent>;

export function content(ref, args) {
    return {
        args,
        factory: (ref as IContentInfo).factory,
    } as IContentInstance;
}


export default Content;