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

        super({
            template: PageHostTemplates.Single,
            ...options
        });

        this.init(PageHost);
    }

    protected initWork() {

        this.onChanged("content", async (value, old) => {

            if (old?.onClose)
                old.onClose();

            if (value?.loadAsync)
                await this.loadPageAsync(value);

            if (value?.onOpen)
                value.onOpen();
        });
    }

    protected async loadPageAsync(page: IPage) {

        if (page.loadState == "")
            await page.loadAsync();
    }

    push(page: IPage) {
        this._stack.push(this.content);
        this.content = page;
        return page;
    }

    pop() {

        this.content = this._stack.pop();
    }

    canGoBack() {

        return true;
    }

    content: IPage;
}

export default PageHost;