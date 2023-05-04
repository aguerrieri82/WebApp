import { ITemplate } from "@eusoft/webapp-core";
import "./index.scss";
import { Content, Template } from "@eusoft/webapp-jsx";
import { IComponentOptions, ViewComponent } from "../ViewComponent";
import { IPage } from "../../Abstraction/IPage";

interface IPageHostOptions extends IComponentOptions {


}

export const PageHostTemplates = {

    "Single": (<Template name="PageHost">
        <main className={m => m.className}>
            <section className="content">
                <Content src={m => m.current}/>
            </section>
        </main>
    </Template>) as ITemplate<PageHost>

}
export default class PageHost extends ViewComponent<IPageHostOptions> {

    protected _stack: IPage[] = [];
    protected _index: number;

    constructor(options?: IPageHostOptions) {

        super(options);

        this.onChanged("current", async (value, old) => {

            if (old?.onClose)
                old.onClose();

            if (value.loadAsync)
                await this.loadPageAsync(value);

            if (value?.onOpen)
                value.onOpen();

        });
    }

    protected async loadPageAsync(page: IPage) {

        await page.loadAsync();
    }

    push(page: IPage) {
        this._stack.push(page);
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