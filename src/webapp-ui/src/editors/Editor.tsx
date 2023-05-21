import { Component } from "@eusoft/webapp-core";
import { IEditor, IEditorOptions, ValueChangedReason } from "../abstraction/IEditor";

export abstract class Editor<TValue, TOptions extends IEditorOptions<TValue>> extends Component<TOptions> implements IEditor<TValue, TOptions>{

    constructor(options?: TOptions) {

        super({
            visible: true,
            commitMode: "auto",
            ...options
        });

        this.init(Editor);
    }

    protected initWork() {

        this.onChanged("value", (v, o) => this.onValueChanged(v, o, this.changeReason));
    }

    protected updateOptions() {

        this.bindOptions("visible", "disabled", "value");
    }

    protected get changeReason(): ValueChangedReason {
        return undefined;
    }

    onValueChanged(value: TValue, oldValue: TValue, reason: ValueChangedReason) {

    }


    visible: boolean;

    disabled: boolean;

    value: TValue;

}