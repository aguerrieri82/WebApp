import { type Bindable, Component, type IComponentOptions, type TemplateMap } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import "./ProgressView.scss";
import { type ViewNode } from "../types";
import { MaterialIcon } from "./Icon";
import { NodeView } from "./NodeView";

export const ProgressViewTemplates: TemplateMap<ProgressView> = {

    "Default": forModel(m => <>
        <div className={m.className}>
            <Class name="indeterminate" condition={m.isIndeterminate} />
            {m.isIndeterminate ?
                <MaterialIcon name="donut_large" /> :
                <div className="progress-bar" style-width={((m.value - m.min) / (m.max - m.min)) * 100 + "%"} />
            }
            <div className="content"><NodeView>{m.content}</NodeView></div>
        </div>
    </>)
}

interface IProgressViewOptions extends IComponentOptions {
    value?: Bindable<number>;
    min?: Bindable<number>;
    max?: Bindable<number>;
    isIndeterminate?: Bindable<boolean>
    content?: ViewNode;
}

export class ProgressView extends Component<IProgressViewOptions> {

    constructor(options?: IProgressViewOptions) {

        super();

        this.init(ProgressView, {
            template: ProgressViewTemplates.Default,
            min: 0,
            max: 1,
            value: 0,
            ...options
        });
    }

    content: ViewNode;

    isIndeterminate: boolean;

    min: number;

    max: number;

    value: number;

}