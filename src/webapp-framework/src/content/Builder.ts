import { type ComponentStyle } from "@eusoft/webapp-core";
import { type IContentOptions, type Content, type IContentInfo, type IFeature, type LocalString, type IAction, formatText } from "@eusoft/webapp-ui";

export interface IContentBuilder {

}

export class ContentBuilder<
    TContent extends Content<TArgs, TOptions>,
    TArgs extends {},
    TOptions extends IContentOptions<TArgs>> {

    protected _factory: (options: TOptions) => TContent;
    protected _options = {} as TOptions;
    protected _optionsFactory: () => Partial<TOptions>;

    constructor(factory: (options: TOptions) => TContent) {
        this._factory = factory;
    }

    info(value: Partial<IContentInfo>) {
        Object.assign(this._options, value);
        return this;
    }

    options(value: Partial<TOptions> | { (): Partial<TOptions> }) {

        if (typeof value == "function")
            this._optionsFactory = value;
        else
            Object.assign(this._options, value);

        return this;
    }

    name(value: string) {
        this._options.name = value;
        return this;
    }

    title(value: LocalString) {
        this._options.title = value;
        return this;
    }

    style(...value: ComponentStyle[]) {
        this._options.style = value;
        return this;
    }

    action(action: IAction) {

        this._options.actions ??= [];

        if (Array.isArray(this._options.actions))
            this._options.actions.push(action);

        return this;
    }

    route(value: string) {
        this._options.route = value;
        return this;
    }

    feature(value: IFeature<TContent>) {

        this._options.features ??= [];
        this._options.features.push(value);
        return this;
    }

    createInstance<TBody extends object>(body?: BindThis<TContent, TBody & TContent>) {

        if (!this._options.title)
            this._options.title = formatText(this._options.name) as string;

        if (this._optionsFactory) {
            const dynOptions = this._optionsFactory();  
            Object.assign(this._options, dynOptions);   
        }

        const res = this._factory(this._options);

        Object.assign(res, body);

        return res as (TBody & TContent);
    }

    asContent<TBody extends object>(body?: BindThis<TContent, TBody & TContent>) {
        return {
            name: this._options.name,            
            route: this._options.route,
            icon: this._options.icon,      
            features: this._options.features,
            factory: () => this.createInstance(body)
        } as IContentInfo<TArgs, TContent & TBody>
    }

}

export function buildContent<
    TContent extends Content
    >(base: Class<TContent>): ContentBuilder<TContent, unknown, TContent["options"]>;

export function buildContent(base: Class<any>) {
     
    if ("builder" in base && typeof base.builder == "function")
        return base.builder(); 
    return new ContentBuilder(options => new base(options));
}