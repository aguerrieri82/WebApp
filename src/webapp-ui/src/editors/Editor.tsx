import { Component } from "@eusoft/webapp-core";
import { type IEditor, type IEditorOptions, type ValueChangedReason } from "../abstraction/IEditor";

export abstract class Editor<TValue, TOptions extends IEditorOptions<TValue> = IEditorOptions<TValue>> extends Component<TOptions> implements IEditor<TValue, TOptions>{

    constructor(options?: TOptions) {

        super();

        this.init(Editor, {
            visible: true,
            commitMode: "auto",
            ...options
        });
    }

    protected override initProps() {

        this.onChanged("value", (v, o) => this.onValueChangedInternal(v, o, this.changeReason));
    }

    protected get changeReason(): ValueChangedReason {
        return undefined;
    }

    protected onValueChangedInternal(value: TValue, oldValue: TValue, reason: ValueChangedReason) {

        this.onValueChanged(value, oldValue, reason);
    }


    onValueChanged(value: TValue, oldValue: TValue, reason: ValueChangedReason) {

    }

    disabled: boolean;

    value: TValue;

}