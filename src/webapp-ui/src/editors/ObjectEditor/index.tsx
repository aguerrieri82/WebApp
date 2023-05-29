import { BindExpression, ITemplate, TemplateMap, withCleanup } from "@eusoft/webapp-core";
import { Content, Template, forModel } from "@eusoft/webapp-jsx";
import { EditorBuilder } from "../EditorBuilder";
import { IInputFieldOptions, InputField } from "../../components";
import { IValidationContext } from "../../abstraction/Validator";
import { CommitableEditor, ICommitableEditorOptions } from "../CommitableEditor";
import { isCommitable } from "../../abstraction/ICommitable";
import { IEditor } from "../../abstraction/IEditor";
import { cloneObject } from "../../utils/Object";
import "./index.scss";

type ObjectEditorValidationMode = "manual" | "onInputChange";

export interface IObjectEditorOptions<TObj extends Record<string, any>> extends ICommitableEditorOptions<TObj, TObj> {

    builder: (builder: EditorBuilder<TObj, ObjectEditor<TObj>>) => ITemplate<TObj> | JSX.Element;

    validationMode?: ObjectEditorValidationMode;

    isDynamic?: boolean;

    inputField?: Partial<IInputFieldOptions<unknown, TObj>>;

}

export const ObjectEditorTemplates: TemplateMap<ObjectEditor<any>> = {

    "Default": forModel(m => <Template name="ObjectEditor">
        <form method="post" className={m.className} visible={m.visible} > 
            <Content src={m.editValue} template={m.contentTemplate()}/>
        </form>
    </Template>)
}

export class ObjectEditor<TObj extends {}> extends CommitableEditor<TObj, TObj, IObjectEditorOptions<TObj>>  {

    protected _inputs: InputField<unknown, IEditor<unknown>>[];
    protected _contentTemplate: ITemplate<TObj>;
     
    constructor(options?: IObjectEditorOptions<TObj>) {

        super();

        this.init(ObjectEditor, {
            validationMode: "manual",
            template: ObjectEditorTemplates.Default,
            value: {} as TObj,
            ...options,
        });
    }

    protected override updateOptions() {

        this.bindOptions("builder", "isDynamic", "validationMode", "inputField");
    }

    contentTemplate() { 

        if (!this._contentTemplate || this.isDynamic) {

            const innerTemplate = this.builder(new EditorBuilder({
                container: this,
                model: a => a.editValue,
                inputField: this.inputField,
                attach: editor => {

                    this._inputs.push(editor);

                    editor.onChanged("value", v => this.onInputChanged(editor, v));
                }
            })) as ITemplate<TObj>;

            this._contentTemplate = withCleanup(innerTemplate, () => this._inputs = []);
        }

        return this._contentTemplate;
    }

    protected async onInputChanged(input: InputField<unknown, IEditor<unknown>>, value: unknown) {

        this.isDirty = true;

        if (this.validationMode == "onInputChange") {

            const innerCtx = {
                target: this.value
            } as IValidationContext<TObj>;

            if (!await input.validateAsync(innerCtx))
                this.isValid = false;
        }
    }


    protected override async commitAsyncWork() {

        let isSuccess = true;

        for (const input of this._inputs) {

            if (isCommitable(input.content)) {
                if (!await input.content.commitAsync())
                    isSuccess = false;
            }
        }

        return isSuccess;
    }

    override async validateAsync<TTarget>(ctx?: IValidationContext<TTarget>, force?: boolean): Promise<boolean> {

        let isValid = true;

        const innerCtx = {
            target: this.value
        } as IValidationContext<TObj>;

        for (const input of this._inputs) {
            if (!await input.validateAsync(innerCtx, force))
                isValid = false;
        }

        this.isValid = isValid;

        return isValid;
    }

    protected override editToValue(editValue: TObj, clone: boolean) {

        if (clone)
            return cloneObject(editValue);

        if (editValue == this.value)
            return editValue;

        const value = this.value ?? {} as TObj;
        Object.assign(value, editValue);
        return value;
    }

    protected override valueToEdit(value: TObj, clone: boolean) {

        const editValue = value ?? {} as TObj;

        if (clone)
            return cloneObject(editValue);

        return editValue;
    }

    isDynamic: boolean;

    validationMode: ObjectEditorValidationMode;

    builder: (builder: EditorBuilder<TObj, this>) => JSX.Element;

    inputField: Partial<IInputFieldOptions<unknown, TObj>>;
}


declare module "../EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        object<TValue>(value: BindExpression<TModel, TValue>, options?: IBuilderEditorOptions<TModel, TValue, IObjectEditorOptions<TValue>>);
    }
}

EditorBuilder.prototype.object = function (this: EditorBuilder<any, any>, value, options) {
    return this.editor(value, ObjectEditor, {
        style: ["vertical-label", "no-box"],
        ...options
    });
}

export default ObjectEditor;