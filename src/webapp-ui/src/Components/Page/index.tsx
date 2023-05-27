import { Bindable, IComponentOptions, Component, ITemplateProvider, TemplateMap } from "@eusoft/webapp-core";
import { forModel, Template } from "@eusoft/webapp-jsx";
import { IPage, LoadState } from "../../abstraction/IPage";
import "./index.scss";
import { IFeature } from "../../abstraction/IFeature";
import { formatText } from "../../utils/Format";
import { NodeView } from "../NodeView";
import { LocalString } from "../../Types";
export interface IPageOptions extends IComponentOptions {

    title?: Bindable<LocalString>;

    content?: Bindable<JSX.Element>;

    route?: string;

    features?: IFeature<IPage>[];

    name: string;
}

export const PageTemplates: TemplateMap<Page> = {

    "Simple": forModel(m => <Template name="PageHost">
        <div className={m.className}>
            <header>
                <h1><NodeView>{formatText(m.title)}</NodeView></h1>
            </header>
            <section className="body">
                {m.content}
            </section>
        </div>
    </Template>)

}			
export class Page<TArgs extends Record<string, any> = unknown, TOptions extends IPageOptions = IPageOptions> extends Component<TOptions> implements IPage<TArgs> {

    protected _loadState: LoadState;

    constructor(options?: TOptions) {

        super();

        this.init(Page, {
            template: PageTemplates.Simple,
            ...options
        });
    }

    protected override updateOptions() {

        this.bindOptions("title", "content", "route", "features");
    }

    async loadAsync(args?: TArgs)  {

        let isValid = true;

        this._loadState = "loading";

        await this.loadAsyncWork(args);

        if (this.features) {

            for (const loader of this.features)
                if (!await loader(this)) {
                    isValid = false;
                    break;
                }
        }

        if (isValid)
            this._loadState = "loaded";
        else
            this._loadState = "error";

        return isValid; 
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


    features: IFeature<this>[];

    title: LocalString;

    content: ITemplateProvider;

    route: string;

    declare name: string;
}


export default Page;