import { type ComponentStyle } from "@eusoft/webapp-core";
import { type IContentOptions, type Content, type IContentInfo, type IContent, type IFeature, type LocalString, type IAction, formatText } from "@eusoft/webapp-ui";


export interface IContentBuilder {

}

export class ContentBuilder<
    TContent extends Content<TArgs, TOptions>,
    TArgs extends {},
    TOptions extends IContentOptions<TArgs>> {

    protected _factory: (options: TOptions) => TContent;
    protected _options = {} as TOptions;

    constructor(factory: (options: TOptions) => TContent) {
        this._factory = factory;
    }

    options(value: Partial<TOptions>) {
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

    feature(value: IFeature<IContent>) {

        this._options.features ??= [];
        this._options.features.push(value);
        return this;
    }

    build<TExtra extends object>(extra?: BindThis<TContent, TExtra>) {

        if (!this._options.title)
            this._options.title = formatText(this._options.name) as string;
        const res = this._factory(this._options);
        Object.assign(res, extra);
        return res as (TExtra & TContent);
    }


    buildContent<TExtra extends object>(extra?: BindThis<TContent, TExtra>) {
        return {
            name: this._options.name,            
            route: this._options.route,
            icon: this._options.icon,            
            factory: () => this.build(extra)
        } as IContentInfo<TArgs, TContent & TExtra>
    }
}

export function buildContent<T extends Content>(base: Class<T>): ContentBuilder<T, unknown, unknown>;

export function buildContent(base) {
     
    if ("builder" in base && typeof base.builder == "function")
        return base.builder(); 
    return new ContentBuilder(options => new base(options));
}