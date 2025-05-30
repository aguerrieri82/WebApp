import { type IContentOptions, type Content, type IContentInfo } from "@eusoft/webapp-ui";


export type Extra<TContent, T> = {
    [K in keyof T]:
    T[K] extends (...args: any[]) => any
    ? (this: TContent & T, ...args: Parameters<T[K]>) => ReturnType<T[K]>
    : T[K];
};


export function declareContent<
        TArgs,
    TOptions extends IContentOptions<TArgs> & { extends?: Extra<Content<TArgs, TOptions>, TExtends> },
        TType extends { new(...args: any[]): Content<TArgs, TOptions> },
        TExtends extends object
    >
    (type: TType, options: TOptions) {

    const newContent = class InlineContent extends type {
        constructor(...args: any[]) {

            super(args[0]);

            this.init(InlineContent, options);

            if (options.extends)
                Object.assign(this, options.extends);
        }        

    } as (TType & { info: IContentInfo } & TExtends);

    newContent.info = {
        name: options.name,
        route: options.route,
        icon: options.icon as any, //TODO fix
        factory: () => new newContent()
    };

    return newContent;
}
