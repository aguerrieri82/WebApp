import { Bindable, IComponentOptions, ITemplate, Component, IComponent, ITemplateProvider, TemplateMap } from "@eusoft/webapp-core";
import { forModel, Template } from "@eusoft/webapp-jsx";
import { IPage, LoadState } from "../../abstraction/IPage";
import "./index.scss";
interface IPageOptions extends IComponentOptions {

    title?: Bindable<string>;

    content?: Bindable<ITemplateProvider>;

    route?: string;

    name: string;
}

export const PageTemplates: TemplateMap<Page> = {

    "Simple": forModel(m => <Template name="PageHost">
        <div className={m.className}>
            <header>
                <h1 text={m.title} />
            </header>
            <section className="body">
                {m.content}
            </section>
        </div>
    </Template>)

}
export class Page<TOptions extends IPageOptions = IPageOptions, TArgs extends Record<string, any> = undefined> extends Component<TOptions> implements IPage<TArgs> {

    protected _loadState: LoadState;

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

    async loadAsync(args?: TArgs)  {

        this._loadState = "loading";

        await this.loadAsyncWork(args);

        this._loadState = "loaded";
    }

    protected async loadAsyncWork(args?: TArgs) {

    }


    onOpen(): void {

    }

    onClose(): void {

    }

    get loadState() {
        return this._loadState;
    }

    title: string;

    content: ITemplateProvider;

    route: string;

    name: string;
}

export default Page;