import { IComponentOptions, Component, TemplateMap } from "@eusoft/webapp-core";
import { forModel, Template } from "@eusoft/webapp-jsx";
import { IContent } from "../../abstraction/IContent";
import { IContentHost } from "../../abstraction";
import "./index.scss";

interface IContentHostOptions extends IComponentOptions {

}

export const ContentHostTemplates: TemplateMap<ContentHost> = {

    "Single": forModel(m => <main className={m.className}>
        <section className="content">
            {m.content}
        </section>
    </main>) 

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


    async loadContentAsync<T>(content: IContent<T>, args?: T) {

        if (content?.loadAsync) {
            try {
                if (!await content.loadAsync(this, args)) {
                    return false;
                }
            }
            catch (ex) {
       
                console.error(ex);
                return false;
            }
        }

        if (this.content?.onCloseAsync)
            await this.content.onCloseAsync();


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

    content: IContent;

    result: unknown;
}

export default ContentHost;