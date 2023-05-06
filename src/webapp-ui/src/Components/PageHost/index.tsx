import { IComponentOptions, ITemplate, Component, TemplateMap } from "@eusoft/webapp-core";
import { Content, Template } from "@eusoft/webapp-jsx";
import { IPage } from "../../Abstraction/IPage";
import "./index.scss";
import { forModel } from "@eusoft/webapp-jsx/src/Runtime";

interface IPageHostOptions extends IComponentOptions {

}

export const PageHostTemplates: TemplateMap<PageHost> = {

    "Single": forModel(m => <Template name="PageHost">
        <main className={m.className}>
            <section className="content">
                {m.current}
            </section>
        </main>
    </Template>) as ITemplate<PageHost>

}
export class PageHost extends Component<IPageHostOptions> {

    protected _stack: IPage[] = [];
    protected _index: number;
    constructor(options?: IPageHostOptions) {

        super();

        this.configure({
            template: PageHostTemplates.Single,
            ...options
        });

        this.onChanged("current", async (value, old) => {

            if (old?.onClose)
                old.onClose();

            if (value?.loadAsync)
                await this.loadPageAsync(value);

            if (value?.onOpen)
                value.onOpen();
        });
    }

    protected async loadPageAsync(page: IPage) {

        await page.loadAsync();
    }

    push(page: IPage) {
        this._stack.push(this.current);
        this.current = page;
    }

    pop() {

        this.current = this._stack.pop();
    }

    canGoBack() {

    }


    current: IPage;

    template = PageHostTemplates.Single;
}