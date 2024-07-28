import { Class, ComponentStyle } from "@eusoft/webapp-core";
import { IContentOptions, Content, IContentInfo, IContent, IFeature, LocalString } from "@eusoft/webapp-ui";


export interface IContentBuilder {

}

export class ContentBuilder<TContent extends Content<TArgs, TOptions>, TArgs extends {}, TOptions extends IContentOptions<TArgs>> {

    protected _factory: (options: TOptions) => TContent;
    protected _options = {} as TOptions;

    constructor(factory: (options: TOptions) => TContent) {
        this._factory = factory;
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


    route(value: string) {
        this._options.route = value;
        return this;
    }

    feature(value: IFeature<IContent>) {

        this._options.features ??= [];
        this._options.features.push(value);
        return this;
    }

    build() {
        return this._factory(this._options);
    }


    buildContent(): IContentInfo<TArgs, TContent> {
        return {
            name: this._options.name,
            route: this._options.route,
            icon: this._options.icon,
            factory: () => this._factory(this._options)
        }
    }
}

export function buildContent<T extends Content>(base: Class<T>): ContentBuilder<T, unknown, unknown>;

export function buildContent(base) {
     
    if ("builder" in base && typeof base.builder == "function")
        return base.builder(); 
    return new ContentBuilder(options => new base(options));
}