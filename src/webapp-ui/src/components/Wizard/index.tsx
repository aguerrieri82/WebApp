import { CatalogTemplate, Component, IComponentOptions } from "@eusoft/webapp-core";
import { ViewNode } from "../../Types";
import { Class, Foreach, JsxTypedComponent, forModel } from "@eusoft/webapp-jsx";
import { Action } from "../Action";
import "./index.scss";
import { NodeView } from "../NodeView";
import { isValidable } from "../../abstraction/IValidable";

export interface IWizardStepOptions {

    name: string;

    title: ViewNode;

    shortTitle?: ViewNode;

    nextLabel?: ViewNode;

    prevLabel?: ViewNode;

    content: ViewNode;

    visible?: boolean;

    canGoNext?: () => boolean;

    canGoPrev?: () => boolean;

    loadAsync?: () => Promise<any>;

    validateAsync?: (step?: WizardStep) => Promise<boolean>;
}

export class WizardStep implements IWizardStepOptions {

    private options: IWizardStepOptions;

    constructor(options?: IWizardStepOptions) {

        this.options = {
            visible: true,
            ...options
        }

        Object.assign(this, this.options);
    }

    async loadAsync(): Promise<any> {

    }

    async validateAsync(step: WizardStep): Promise<boolean> {

        if (isValidable(this.content))
            return await this.content.validateAsync();

        return true;
    }

    canGoNext() {
        return true;
    }

    canGoPrev() {
        return true;
    }

    name: string;

    title: ViewNode;

    shortTitle?: ViewNode;

    nextLabel?: ViewNode;

    prevLabel?: ViewNode;

    completed: boolean;

    visible: boolean;

    content: ViewNode;

    template: CatalogTemplate<WizardStep>;
}


export interface IWizardOptions extends IComponentOptions {

    content?: (IWizardStepOptions | WizardStep | JsxTypedComponent<IWizardStepOptions>)[];

    finishLabel?: ViewNode;

    nextLabel?: ViewNode;

    prevLabel?: ViewNode;

    showStepList?: boolean;

    activeStepIndex?: number;
}

export class Wizard extends Component<IWizardOptions> {

    constructor(options?: IWizardOptions) {
        super();

        this.init(Wizard, {

            activeStepIndex: 0,
            nextLabel: "next ❯",
            prevLabel: "❮ prev",
            template: forModel((m: this) => <div className={m.className} visible={m.visible}>
                <Class name={"step-" + (m.activeStep?.name ?? "none")}/>
                <ol className="step-list">
                    <Foreach src={m.content}>
                        {i => <li visible={i.visible}>
                            <Class name="active" condition={m.activeStep == i} /> 
                            <Class name="completed" condition={i.completed} /> 
                            <NodeView>{i.shortTitle ?? i.title}</NodeView>
                        </li>}
                    </Foreach>
                </ol>
                <section className="body">
                    <header>
                        <NodeView>{m.activeStep?.title}</NodeView>
                    </header>
                    <div className="content">
                    {m.activeStep?.content}
                    </div>
                    <footer>
                        {m.canGoPrev ?
                            <Action name="prev" executeAsync={() => m.prevAsync()}>
                                <NodeView>{m.activeStep?.prevLabel || m.prevLabel}</NodeView>
                            </Action> : <span />}
                        {m.canGoNext ?
                            <Action name="next" executeAsync={() => m.nextAsync()}>
                                <NodeView>{m.activeStep?.nextLabel || m.nextLabel}</NodeView>
                            </Action> : <span />}
                    </footer>
                </section>
            </div>),
            ...options
        });
    }


    mount(ctx) {

        this.activeStepIndex = 0;
        super.mount(ctx);
    }

    protected initWork() {

        this.onChanged("activeStepIndex", (v, o) => this.activeStep = this.content ? this.content[v] : undefined);

        this.onChanged("activeStep", (v, o) => this.activeStepIndex = this.content ? this.content.indexOf(v) : -1);
    }


    protected updateOptions() {

        this.bindOptions("nextLabel", "prevLabel", "showStepList", "activeStepIndex", "content");
    }

    nextAsync() {

        if (this.canGoNext)
            this.goToAsync(this.activeStepIndex + 1, true);
    }

    prevAsync() {

        if (this.canGoPrev)
            this.goToAsync(this.activeStepIndex - 1, false);
    }

    async goToAsync(index: number, validate: boolean) {

        if (validate) {
            if (!await this.activeStep.validateAsync(this.activeStep))
                return;
            this.activeStep.completed = true;
        }

        this.activeStepIndex = index;
    }

    get canGoNext() {
        return this.content &&
            this.activeStepIndex < this.content.length - 1 &&
            (!this.activeStep?.canGoNext || this.activeStep.canGoNext());
    }

    get canGoPrev() {
        return this.content &&
               this.activeStepIndex > 0 &&
              (!this.activeStep?.canGoPrev || this.activeStep.canGoPrev());
    }

    nextLabel: ViewNode;

    prevLabel: ViewNode;

    showStepList: boolean;

    activeStep: WizardStep;

    activeStepIndex: number;

    content: WizardStep[] = [];
}
