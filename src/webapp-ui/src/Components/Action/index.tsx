import { Bindable, IComponentOptions, ITemplate, IComponent, Component, ITemplateProvider, TemplateMap } from "@eusoft/webapp-core";
import { Content, Template } from "@eusoft/webapp-jsx";
import "./index.scss";
import { forModel } from "@eusoft/webapp-jsx/src/Runtime";

interface IActionOptions extends IComponentOptions {

    content?: Bindable<string | IComponent>;

    executeAsync?: () => Promise<any>;
}

export const ActionTemplates: TemplateMap<Action> = {

    "Button": forModel(a => <Template name="Action"> 
        <button behavoir="Ripple" className={a.className} on-click={a.executeAsync()}>
            {a.content}
        </button>
    </Template>)
}
export class Action extends Component<IActionOptions> {

    constructor(options?: IActionOptions) {

        super();

        this.configure({
            ...options,
            template: ActionTemplates.Button
        });
    }

    protected updateOptions() {

        this.bindOptions("content", "executeAsync");
    }

    async executeAsync() {

    }

    content: string | ITemplateProvider;
}