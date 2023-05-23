import { IComponentOptions, Component, TemplateMap } from "@eusoft/webapp-core";
import { forModel, Template } from "@eusoft/webapp-jsx";
import { IPage } from "../../abstraction/IPage";
import "./index.scss";

interface IPageHostOptions extends IComponentOptions {

}

export const PageHostTemplates: TemplateMap<PageHost> = {

    "Single": forModel(m => <Template name="PageHost">
        <main className={m.className}>
            <section className="content">
                {m.content}
            </section>
        </main>
    </Template>) 

}
export class PageHost extends Component<IPageHostOptions> {

    protected _stack: IPage[] = []; 
    protected _index: number;
    constructor(options?: IPageHostOptions) {

        super();

        this.init(PageHost, {
            template: PageHostTemplates.Single,
            ...options
        });
    }


    async loadPageAsync<T>(page: IPage<T>, args?: T) {

        if (page?.loadAsync) {
            if (!await page.loadAsync(page, args))
                return false;
        }

        if (this.content?.onClose)
            this.content.onClose();

        this.content = page;

        if (this.content.onOpen)
            page.onOpen();

        return true;
    }


    push(page: IPage) {
        this._stack.push(this.content);
        this.loadPageAsync(page);
        return page;
    }

    pop() {

        this.loadPageAsync(this._stack.pop());
    }

    content: IPage;
}

export default PageHost;