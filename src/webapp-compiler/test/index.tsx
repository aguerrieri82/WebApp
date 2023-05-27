import { TemplateMap } from "@eusoft/webapp-core";
import { Content } from "@eusoft/webapp-framework/content/Content";
import { forModel } from "@eusoft/webapp-jsx";
import { Action, IPageOptions, Page } from "@eusoft/webapp-ui";

interface IAppPageOptions extends IPageOptions {


}

export const AppPageTemplates: TemplateMap<AppPage<unknown>> = {

    "Default": forModel(m => <div className={m.className}>
        <div className="body">
            {m.content}
        </div>
    </div>)
}

export class AppPage<TArgs = unknown> extends Page<TArgs, IAppPageOptions> {

    constructor(options?: IAppPageOptions) {

        super();

        this.init(AppPage, {
            template: AppPageTemplates.Default,
            ...options
        });
    }
}

export function contentPage<TContent extends Content<unknown>>(content: TContent, route?: string) {

    return new AppPage({
        name: content.name,
        title: content.title,
        content: forModel(this, m => <>
            {content}
            <div className="actions">
                {content.actions?.forEach(a => <Action executeAsync={a.executeAsync}>{a.text}</Action>)}
            </div>
        </>),
        route
    })
}

export default AppPage;