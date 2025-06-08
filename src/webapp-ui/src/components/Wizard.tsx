import { type CatalogTemplate, Component, type IComponentOptions } from "@eusoft/webapp-core";
import { type ViewNode } from "../Types";
import { Class, type JsxTypedComponent, forModel } from "@eusoft/webapp-jsx";
import { Action } from "./Action";
import { NodeView } from "./NodeView";
import {  isValidable } from "../abstraction/IValidable";
import { isAsyncLoad } from "../abstraction";
import "./Wizard.scss";

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

    loadAsync?: () => Promise<unknown>;

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

    async loadAsync(): Promise<void> {

        if (isAsyncLoad(this.content))
            await this.content.loadAsync();
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
                    {m.content.forEach(i =>
                        <li visible={i.visible}>
                            <Class name="active" condition={m.activeStep == i} /> 
                            <Class name="completed" condition={i.completed} /> 
                            <NodeView>{i.shortTitle ?? i.title}</NodeView>
                        </li>
                    )}
                </ol>
                <section className="body">
                    <header>
                        <NodeView>{m.activeStep?.title}</NodeView>
                    </header>
                    <div className="content">
                        <NodeView>{m.activeStep?.content}</NodeView>
                    </div>
                    <footer>
                        {m.canGoPrev ?
                            <Action name="prev" onExecuteAsync={() => m.prevAsync()}>
                                {m.activeStep?.prevLabel || m.prevLabel}
                            </Action> : <span />}
                        {m.canGoNext ?
                            <Action name="next" onExecuteAsync={() => m.nextAsync()}>
                                {m.activeStep?.nextLabel || m.nextLabel}
                            </Action> : <span />}
                    </footer>
                </section>
            </div>),
            ...options
        });
    }

    override mount(ctx) {

        this.activeStepIndex = 0;
        super.mount(ctx);
    }

    protected override initProps() {

        this.onChanged("activeStepIndex", index => this.activeStep = this.content ? this.content[index] : undefined);

        this.onChanged("activeStep", step => {

            this.activeStepIndex = this.content ? this.content.indexOf(step) : -1;

            if (step)
                step.loadAsync();
        });
    }

    nextAsync() {

        if (this.canGoNext) {

            let curStep = this.activeStepIndex;

            while (curStep < this.content.length - 1 ) {
                curStep++;
                if (this.content[curStep].visible) {
                    this.goToAsync(curStep, true);
                    break;
                }
            }
        } 
    }

    prevAsync() {

        if (this.canGoPrev) {

            let curStep = this.activeStepIndex;

            while (curStep > 0) {
                curStep--;
                if (this.content[curStep].visible) {
                    this.goToAsync(curStep, false);
                    break;
                }

            }
        }
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
