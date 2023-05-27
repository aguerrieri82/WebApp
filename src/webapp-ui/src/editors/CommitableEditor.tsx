import { IEditorOptions, ValueChangedReason } from "../abstraction/IEditor";
import { Editor } from "./Editor";
import { CommitMode, ICommitable } from "../abstraction/ICommitable";
import { IValidable } from "../abstraction/IValidable";
import { IValidationContext } from "../abstraction/Validator";
import { ViewNode } from "../Types";


type EditState = "" | "committed" | "committing" | "validating";

export interface ICommitableEditorOptions<TValue, TEditValue> extends IEditorOptions<TValue> {
    commitMode?: CommitMode;
}

export abstract class CommitableEditor<TValue, TEditValue, TOptions extends ICommitableEditorOptions<TValue, TEditValue>> extends Editor<TValue, TOptions> implements ICommitable<TEditValue>, IValidable {

    protected _editState: EditState;

    constructor(options?: TOptions) {

        super();

        this.init(CommitableEditor, {
            commitMode: "auto",
            ...options
        });
    }

    protected override initWork() {
        this.onChanged("commitMode", () => this.updateEditValue(this.value));
    }

    protected override updateOptions() {

        this.bindOptions("commitMode");
    }

    protected override get changeReason() : ValueChangedReason {
        return this._editState == "committing" ? "edit" : undefined;
    }

    protected updateEditValue(value: TValue) {

        if (value === undefined)
            return;

        this.editValue = this.valueToEdit(value, this.commitMode != "auto");
        this.isDirty = false;
    }

    override onValueChanged(value: TValue, oldValue: TValue, reason: ValueChangedReason) {

        if (reason != "edit")
            this.updateEditValue(value);
    }

    async validateAsync<TTarget>(ctx?: IValidationContext<TTarget>, force?: boolean): Promise<boolean> {

        return true;
    }

    protected editToValue(value: TEditValue, clone?: boolean): TValue {

        return value as unknown as TValue;
    }

    protected valueToEdit(value: TValue, clone?: boolean): TEditValue {

        return value as unknown as TEditValue;
    }

    async commitAsync(): Promise<boolean> {

        if (!await this.validateAsync())
            return false;

        this._editState = "committing";

        try {

            if (await this.commitAsyncWork()) {

                this.value = this.editToValue(this.editValue, this.commitMode != "manual-inplace");

                this.isDirty = false;
            }
        }
        finally {
            this._editState = "committed";
        }

        return true;
    }

    protected async commitAsyncWork()  {
        return true; 
    }

    error: ViewNode;

    isValid: boolean;

    isDirty: boolean;

    editValue: TEditValue;

    commitMode: CommitMode;
}