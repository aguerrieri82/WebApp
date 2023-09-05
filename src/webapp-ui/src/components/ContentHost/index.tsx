import { IComponentOptions, Component, TemplateMap } from "@eusoft/webapp-core";
import { forModel, Template } from "@eusoft/webapp-jsx";
import { IContent } from "../../abstraction/IContent";
import { IContentHost } from "../../abstraction";
import "./index.scss";

interface IContentHostOptions extends IComponentOptions {

}

export const ContentHostTemplates: TemplateMap<ContentHost> = {

    "Single": forModel(m => <Template name="PageHost">
        <main className={m.className}>
            <section className="content">
                {m.content}
            </section>
        </main>
    </Template>) 

}
export class ContentHost extends Component<IContentHostOptions> implements IContentHost {

    protected _stack: IContent[] = []; 
    protected _index: number;
    constructor(options?: IContentHostOptions) {

        super();

        this.init(ContentHost, {
            template: ContentHostTemplates.Single,
            ...options
        });
    }


    async loadContentAsync<T>(page: IContent<T>, args?: T) {

        if (page?.loadAsync) {
            if (!await page.loadAsync(this, args)) {
                return false;
            }
        }

        if (this.content?.onCloseAsync)
            await this.content.onCloseAsync();


        this.content = page;

        if (this.content.onOpenAsync)
            await page.onOpenAsync();

        return true;
    }


    push(page: IContent) {
        this._stack.push(this.content);
        this.loadContentAsync(page);
        return page;
    }

    pop() {

        this.loadContentAsync(this._stack.pop());
    }


    closeAsync(result?: unknown): Promise<void> {

        throw new Error("Method not implemented.");
    }

    get canGoBack() {

        return false;
    }

    content: IContent;

    result: unknown;
}

export default ContentHost;