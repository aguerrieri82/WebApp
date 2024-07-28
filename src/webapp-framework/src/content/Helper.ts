import { IContentOptions, Content, IContentInfo } from "@eusoft/webapp-ui";

export function declareContent<TArgs, TOptions extends IContentOptions<TArgs>, TType extends { new(...args: any[]): Content<TArgs, TOptions> }>(type: TType, options: TOptions) {

    const newContent = class InlineContent extends type {
        constructor(...args: any[]) {

            super(args[0]);

            this.init(InlineContent, options);
        }

    } as (TType & { info: IContentInfo });

    newContent.info = {
        name: options.name,
        route: options.route,
        icon: options.icon as any, //TODO fix
        factory: () => new newContent()
    };

    return newContent;
}
