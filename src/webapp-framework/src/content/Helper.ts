import { type IContentOptions, type Content, type IContentInfo, contentInfo } from "@eusoft/webapp-ui";


export type Extra<TContent, T> = {
    [K in keyof T]:
    T[K] extends (...args: any[]) => unknown
    ? (this: TContent & T, ...args: Parameters<T[K]>) => ReturnType<T[K]>
    : T[K];
};


export function declareContent<
    TArgs,
    TName extends string,
    TOptions extends IContentOptions<TArgs, TName> & { extends?: Extra<Content<TArgs, TOptions>, TExtends> },
    TType extends { new(...args: any[]): Content<TArgs, TOptions> },
    TExtends extends object = {}
    >
    (type: TType, options: TOptions) {

    const newContent = class InlineContent extends type {
        constructor(...args: any[]) {

            super(args[0]);

            /*
            if (typeof (options) == "function")
                options = options();
            */

            this.init(InlineContent, options);

            if (options.extends)
                Object.assign(this, options.extends);
        }        

    } as (TType & { info: IContentInfo<TArgs, InstanceType<TType>, TName>});

    newContent.info = contentInfo({
        name: options.name,
        route: options.route,
        icon: options.icon, 
        factory: () => (new newContent() as InstanceType<TType>)
    });

    return newContent;
}
