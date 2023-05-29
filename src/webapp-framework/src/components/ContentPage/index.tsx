import { Bindable, TemplateMap } from "@eusoft/webapp-core";
import { forModel } from "@eusoft/webapp-jsx";
import { Action, IContent, IContentHost, IPageOptions, Page, formatText, isAsyncLoad } from "@eusoft/webapp-ui";
import router from "../../services/Router";

export interface IContentPageOptions<TArgs = {}, TContent extends IContent = IContent> extends IPageOptions<TArgs> {

    contentList: TContent[];

    activeContent?: Bindable<string, "two-ways">;

    showBack?: boolean;

    content?: TContent;

    onContentLoadAsync?: (content: TContent, args: TArgs) => Promise<any>;
}

export const ContentPageTemplates: TemplateMap<ContentPage<unknown>> = {

    "Default": forModel(m => <div className={m.className}>
        <header>
            {m.showBack && <Action onExecuteAsync={() => router.backAsync()} style="icon">❮</Action>}
            <span className="title">{formatText(m.title)}</span>
        </header>
        <div className="body">
            {m.content}
        </div>
        <footer>
            {m.content?.actions.forEach(a =>
                <Action name={a.name} onExecuteAsync={a.executeAsync}>
                    {[a.icon, a.text]}
                </Action> 
            )}
        </footer>
    </div>)
}

export class ContentPage<TArgs, TContent extends IContent = IContent, TOptions extends IContentPageOptions<TArgs> = IContentPageOptions<TArgs, TContent>> extends Page<TArgs, TOptions> implements IContentHost {
    constructor(options?: TOptions) {

        super();

        this.init(ContentPage, {
            template: ContentPageTemplates.Default,
            ...options
        });
    }

    override onOpen() {

        this.result = undefined;
    }

    async closeAsync(result?: unknown): Promise<void> {

        this.result = result;
        await router.backAsync();
    }

    override updateOptions() {

        this.bindOptions("contentList", "activeContent", "showBack", "onContentLoadAsync");
    }

    protected override initProps() {

        this.onChanged("activeContent", name => {

            const content = this.contentList.find(a => a.name == name);

            if (content)
                this.loadContentAsync(content);
        });
    }

    protected async loadContentAsync(content: TContent) {

        this.activeContent = content.name;

        this.content = content;
    }

    override async loadAsyncWork(args: TArgs) {

        if (!args)
            args = {} as TArgs;

        if (this.content?.openAsync)
            await this.content.openAsync(this, args);

        await this.onContentLoadAsync(this.content, args);
    }

    async onContentLoadAsync(content: TContent, args: TArgs) {

    }

    result: unknown;

    contentList: TContent[];

    activeContent: string;

    showBack: boolean;

    declare content: TContent;
}

export function contentPage<TArgs, TContent extends IContent>(content: TContent, options?: Partial<IContentPageOptions<TArgs, TContent>>) {

    return new ContentPage<TArgs, TContent>({
        name: content.name,
        title: content.title,
        contentList: [content],
        activeContent: content.name,
        ...options
    })
}


export default ContentPage;