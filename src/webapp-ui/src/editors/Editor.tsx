import { Component } from "@eusoft/webapp-core";
import { IEditor, IEditorOptions, ValueChangedReason } from "../abstraction/IEditor";

export abstract class Editor<TValue, TOptions extends IEditorOptions<TValue>> extends Component<TOptions> implements IEditor<TValue, TOptions>{

    constructor(options?: TOptions) {

        super();

        this.init(Editor, {
            visible: true,
            commitMode: "auto",
            ...options
        });
    }

    protected override initWork() {

        this.onChanged("value", (v, o) => this.onValueChanged(v, o, this.changeReason));
    }

    protected override updateOptions() {

        this.bindOptions("visible", "disabled", "value");
    }

    protected get changeReason(): ValueChangedReason {
        return undefined;
    }

    onValueChanged(value: TValue, oldValue: TValue, reason: ValueChangedReason) {

    }

    disabled: boolean;

    value: TValue;

}