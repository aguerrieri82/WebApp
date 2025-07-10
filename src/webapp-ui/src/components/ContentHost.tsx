import { Component, type IComponentOptions,  type TemplateMap } from "@eusoft/webapp-core";
import { Content, forModel } from "@eusoft/webapp-jsx";
import { type IContent } from "../abstraction/IContent";
import "./ContentHost.scss";
import type { IContentHost } from "../abstraction/IContentHost";
import type { LoadResult } from "../types";

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

export class ContentHost<TContent extends IContent<ObjectLike> = IContent<ObjectLike>> extends Component<IContentHostOptions> implements IContentHost {

    protected _stack: TContent[] = []; 
    protected _index: number;

    constructor(options?: IContentHostOptions) {

        super();

        this.init(ContentHost, {
            template: ContentHostTemplates.Single,
            useTransition: true,
            ...options
        });

    }

    async loadContentAsync<TArgs extends ObjectLike = ObjectLike>(content: TContent & IContent<TArgs>, args?: TArgs): Promise<LoadResult>{

        if (this.content?.onCloseAsync) {

            if (!await this.content.onCloseAsync())
                return false;
        }

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

        if ("startViewTransition" in document && this.useTransition) {

            const ts = document.startViewTransition(async () => {
                this.content = content;
            });

            await ts.updateCallbackDone;
        }
        else
            this.content = content;

        if (this.content?.onOpenAsync)
            await content.onOpenAsync();

        this.onContentLoaded();

        return true;
    }

    protected onContentLoaded() {

    }

    push(page: TContent) {

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

    content: TContent;

    result: unknown;
}