import { Component, type IComponentOptions,  type TemplateMap } from "@eusoft/webapp-core";
import { Content, forModel } from "@eusoft/webapp-jsx";
import { type IContent } from "../abstraction/IContent";
import "./ContentHost.scss";
import type { IContentHost } from "../abstraction/IContentHost";

interface IContentHostOptions extends IComponentOptions {
    useTransition: boolean;
}

export const ContentHostTemplates: TemplateMap<ContentHost> = {

    "Single": forModel(m => <main className={m.className}>
        <section className="content">
            <Content src={m.content} />
        </section>
    </main>)

}

export class ContentHost extends Component<IContentHostOptions > implements IContentHost {

    protected _stack: IContent[] = []; 
    protected _index: number;

    constructor(options?: IContentHostOptions) {

        super();

        this.init(ContentHost, {
            template: ContentHostTemplates.Single,
            useTransition: true,
            ...options
        });
    }

    async loadContentAsync<T>(content: IContent<T>, args?: T) {

        if (content?.loadAsync) {

            try {

                if (!await content.loadAsync(this, args)) 
                    return false;
            }
            catch (ex) {
       
                console.error(ex);
                return false;
            }
        }

        if (this.content?.onCloseAsync)
            await this.content.onCloseAsync();

        if ("startViewTransition" in document && this.useTransition) {

            const ts = document.startViewTransition(async () => {
                this.content = content;
            });

            await ts.updateCallbackDone;
        }
        else
            this.content = content;

        if (this.content.onOpenAsync)
            await content.onOpenAsync();

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

    useTransition: boolean;

    content: IContent;

    result: unknown;
}

export default ContentHost;