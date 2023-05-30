import { Bindable, IComponentOptions, Component, ITemplateProvider, TemplateMap } from "@eusoft/webapp-core";
import { forModel, Template } from "@eusoft/webapp-jsx";
import { IPage, IPageInfo, LoadState } from "../../abstraction/IPage";
import { IFeature } from "../../abstraction/IFeature";
import { formatText } from "../../utils/Format";
import { NodeView } from "../NodeView";
import { LocalString } from "../../Types";
import { useOperation } from "../../utils";
import "./index.scss";

export interface IPageOptions<TArgs extends {}> extends IComponentOptions {

    title?: Bindable<LocalString>;

    content?: Bindable<JSX.Element>;

    route?: string;

    features?: IFeature<IPage>[];

    loadAsync?: (args: TArgs) => Promise<any>; 
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
export class Page<TArgs extends {} = unknown, TOptions extends IPageOptions<TArgs> = IPageOptions<TArgs>> extends Component<TOptions> implements IPage<TArgs> {

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
        if (this.options.loadAsync)
            this.onLoadAsync = this.options.loadAsync;
    }

    async loadAsync(args?: TArgs)  {

        let isValid = true;

        this._loadState = "loading";

        await useOperation(async () => {

            await this.onLoadAsync(args);

            if (this.features) {

                for (const loader of this.features)
                    if (!await loader(this)) {
                        isValid = false;
                        break;
                    }
            }
        }, {name: "load page " + this.name});

        if (isValid)
            this._loadState = "loaded";
        else
            this._loadState = "error";

        return isValid; 
    }

    protected async onLoadAsync(args?: TArgs) {

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

    static info: IPageInfo;
}


export default Page;