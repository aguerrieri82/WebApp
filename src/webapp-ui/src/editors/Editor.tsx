import { Component } from "@eusoft/webapp-core";
import { IEditor, IEditorOptions, ValueChangedReason } from "../abstraction/IEditor";

export abstract class Editor<TValue, TOptions extends IEditorOptions<TValue>> extends Component<TOptions> implements IEditor<TValue, TOptions>{

    constructor(options?: TOptions) {

        super();

        this.configure(options);

        this.prop("value").subscribe((v, o) => this.onValueChanged(v, o, ""));
    }

    protected updateOptions() {

        this.bindOptions("visible", "disabled", "value");
    }

    onValueChanged(value: TValue, oldValue: TValue, reason: ValueChangedReason) {

    }


    visible: boolean;

    disabled: boolean;

    value: TValue;
}