import { type IContentOptions, type Content, type IContentInfo, contentInfo } from "@eusoft/webapp-ui";


export function declareContent<
    TArgs,
    TOptions extends IContentOptions<TArgs> & { extends?: BindThis<Content<TArgs, TOptions>, TExtends> },
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

    } as (TType & { info: IContentInfo<TArgs, InstanceType<TType>>});

    newContent.info = contentInfo({
        name: options.name,
        route: options.route,
        icon: options.icon, 
        factory: () => (new newContent() as InstanceType<TType>)
    });

    return newContent;
}
