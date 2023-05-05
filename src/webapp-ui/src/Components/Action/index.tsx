import { Bindable, IComponentOptions, ITemplate, IComponent, Component, ITemplateProvider } from "@eusoft/webapp-core";
import { Content, Template } from "@eusoft/webapp-jsx";
import "./index.scss";

interface IActionOptions extends IComponentOptions {

    content?: Bindable<string | IComponent>;

    executeAsync?: () => Promise<any>;
}

export const ActionTemplates = {

    "Button": (<Template name="Action">
        <button behavoir="Ripple" className={m => m.className} on-click={m => m.executeAsync()}>
            <Content src={m => m.content} />
        </button>
    </Template>) as ITemplate<Action>

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