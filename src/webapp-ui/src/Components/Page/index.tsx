import { Bindable, IComponentOptions, ITemplate, Component } from "@eusoft/webapp-core";
import { Content, Template } from "@eusoft/webapp-jsx";
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
export class Page<TOptions extends IPageOptions = IPageOptions> extends Component<TOptions> implements IPage {

    constructor(options?: TOptions) {

        super();

        this.configure({
            template: PageTemplates.Simple,
            ...options
        });
    }

    protected updateOptions() {

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
}