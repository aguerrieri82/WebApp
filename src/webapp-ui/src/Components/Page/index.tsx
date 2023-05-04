import { ITemplate, IViewComponent } from "@eusoft/webapp-core";
import { Content, Template } from "@eusoft/webapp-jsx";
import { Bindable, IComponentOptions, ViewComponent } from "../ViewComponent";
import { IPage } from "../../Abstraction/IPage";
import "./index.scss";

interface IPageOptions extends IComponentOptions {

    title?: Bindable<string>;

    content?: Bindable<IViewComponent>;

    route?: string;

    name: string;
}

export const PageTemplates = {

    "Simple": (<Template name="PageHost">
        <div className={m => m.className}>
            <header>
                <h1 text={m => m.title} />
            </header>
            <section className="body">
                <Content src={m => m.content}/>
            </section>
        </div>
    </Template>) as ITemplate<Page>

}
export class Page extends ViewComponent<IPageOptions> implements IPage {

    constructor(options?: IPageOptions) {

        super(options);

        this.bindOptions("title", "content", "route", "name");

    }

    async loadAsync()  {

    }

    onOpen(): void {

    }

    onClose(): void {

    }

    title: string;

    content: IViewComponent;

    route: string;

    name: string;

    template = PageTemplates.Simple;
}