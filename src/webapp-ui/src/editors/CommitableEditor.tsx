import { type IEditorOptions, type ValueChangedReason } from "../abstraction/IEditor";
import { Editor } from "./Editor";
import { type CommitMode, type ICommitable } from "../abstraction/ICommitable";
import { type IValidable } from "../abstraction/IValidable";
import { type IValidationContext } from "../abstraction/Validator";
import { type ViewNode } from "../Types";
import { cleanProxy, getTypeName } from "@eusoft/webapp-core";


type EditState = "" | "committed" | "committing" | "validating" | "editing" | "loading";

export interface ICommitableEditorOptions<TValue, TEditValue> extends IEditorOptions<TValue> {
    commitMode?: CommitMode;
}

export abstract class CommitableEditor<TValue, TEditValue, TOptions extends ICommitableEditorOptions<TValue, TEditValue>> extends Editor<TValue, TOptions> implements ICommitable<TValue, TEditValue>, IValidable {

    protected _editState: EditState;

    constructor(options?: TOptions) {

        super();

        this.init(CommitableEditor, {
            commitMode: "auto",
            ...options
        });
    }

    protected override initProps() {

        this._editState = "loading";

       this.onChanged("commitMode", () => this.beginEdit(this.value));
    }

    protected override get changeReason(): ValueChangedReason {

        if (this._editState == "committing")
            return "edit";

        if (this._editState == "loading")
            return "load";

        return undefined;
    }

    beginEdit(value?: TValue) : void {

        /*
        if (value === undefined)
            return;
        */

        console.group("beginEdit");

        this._editState = "loading";

        this.editValue = this.valueToEdit(value, this.commitMode != "auto-inplace" && this.commitMode != "manual-inplace");

        this.isDirty = false;

        this._editState = "editing";

        console.log(this.editValue, this.name ?? getTypeName(this));

        console.groupEnd();
    }

    protected override onValueChangedInternal(value: TValue, oldValue: TValue, reason: ValueChangedReason) {

        //console.log("onValueChangedInternal", reason);

        if (reason != "edit") 
            this.beginEdit(value);
        super.onValueChangedInternal(value, oldValue, reason);  
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
 
        if (this._editState == "committing" || this._editState == "loading")
            return;

        if (!await this.validateAsync())
            return false;

        console.group("commit", this.name ?? getTypeName(this));

        this._editState = "committing";

        try {

            if (await this.commitAsyncWork()) {

                //console.log("editToValue");

                const curValue = this.value;

                this.value = this.editToValue(this.editValue,
                    this.commitMode != "manual-inplace" &&
                    this.commitMode != "auto-inplace");

                if (curValue == this.value) 
                    this.onValueChanged(cleanProxy(this.value), cleanProxy(curValue), "edit");

                this.isDirty = false;
            }
        }
        finally {
            this._editState = "committed";

            console.groupEnd();
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