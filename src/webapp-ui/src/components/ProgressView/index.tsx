import { Bindable, Component, IComponentOptions, TemplateMap } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import "./index.scss";
import { ViewNode } from "../../Types";
import { MaterialIcon } from "../Icon";


export const ProgressViewTemplates: TemplateMap<ProgressView> = {

    "Default": forModel(m => <>
        <div className={m.className}>
            <Class name="indeterminate" condition={m.isIndeterminate} />
            {m.isIndeterminate ?
                <MaterialIcon name="donut_large" /> :
                <>xxx</>
            }
            <div>{m.content}</div>
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

    protected updateOptions() {

        this.bindOptions("content", "isIndeterminate", "min", "max", "value");
    }

    content: ViewNode;

    isIndeterminate: boolean;

    min: number;

    max: number;

    value: number;

}