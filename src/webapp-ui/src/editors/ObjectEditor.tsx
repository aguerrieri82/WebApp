import { type Bindable, type BindExpression, configureBindings, type ITemplate, type TemplateMap, withCleanup, withNotify } from "@eusoft/webapp-core";
import { Class, Content, forModel } from "@eusoft/webapp-jsx";
import { EditorBuilder } from "./EditorBuilder";
import { type IInputFieldOptions, type InputField } from "../components";
import { type IValidationContext } from "../abstraction/Validator";
import { CommitableEditor, type ICommitableEditorOptions } from "./CommitableEditor";
import { type IEditor } from "../abstraction/IEditor";
import { cloneObject, emptyObject } from "../utils/Object";
import "./ObjectEditor.scss";
import { isAsyncLoad, type IAsyncLoad } from "../abstraction/IAsyncLoad";

type ObjectEditorValidationMode = "manual" | "onInputChange";

export interface IObjectEditorOptions<TObj extends ObjectLike> extends ICommitableEditorOptions<TObj, TObj> {

    builder?: (builder: EditorBuilder<TObj, ObjectEditor<TObj>>) => ITemplate<TObj> | JSX.Element;

    validationMode?: ObjectEditorValidationMode;

    isDynamic?: boolean;

    inputField?: Partial<IInputFieldOptions<unknown, TObj>>;

    isValid?: Bindable<boolean>;

}

export const ObjectEditorTemplates: TemplateMap<ObjectEditor<any>> = {

    "Default": forModel(m => <div className={m.className} visible={m.visible} >
        <Class name="no-box" />
        <Content src={m.editValue} template={m.contentTemplate()} />
    </div>),
    "Form": forModel(m => <form method="post" className={m.className} visible={m.visible} >
        <Class name="no-box" />
        <Content src={m.editValue} template={m.contentTemplate()} />
    </form>),

}

export class ObjectEditor<TObj extends ObjectLike>
    extends CommitableEditor<TObj, TObj, IObjectEditorOptions<TObj>>
    implements IAsyncLoad {

    protected _inputs: InputField<unknown, IEditor<unknown>>[];
    protected _contentTemplate: ITemplate<TObj>;
    protected _isLoaded: boolean;

    constructor(options?: IObjectEditorOptions<TObj>) {

        super();

        this.init(ObjectEditor, {
            validationMode: "manual",
            template: ObjectEditorTemplates.Default,
            ...options,
        });

        this.inputValue = new Proxy(this, {
            get: (t, p, r) => {
                const editor = t.getPropEditor(p as keyof TObj & string);
                return editor?.value;
            }
        }) as any;
    }

    override async beginEdit(value) {
        /*
        if (!this._isLoaded)
            await this.loadAsync();
        */
        super.beginEdit(value);
    }

    async loadAsync() {

        if (webApp.debugEdit)
            console.group("loadAsync");

        if (this._inputs) 
            await Promise.all(this._inputs.filter(a => isAsyncLoad(a)).map(a => a.loadAsync()));

        if (webApp.debugEdit)
            console.groupEnd();

        this._isLoaded = true;
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

            this._contentTemplate = withNotify(
                withCleanup(innerTemplate,
                    () => this._inputs = []),
                () => this.onReady());
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

        if (webApp.debugEdit)
            console.log("onInputChanged", input.name, this._editState);

        if ((this.commitMode == "auto" || this.commitMode == "auto-inplace") &&
            input.isAttached &&
            this._editState != "loading" &&
            this._editState != "committing") {

            await this.commitAsync();
        }

        input.isAttached = true;
    }

    getPropEditor<TKey extends keyof TObj & string, TEditor = IEditor<TObj[TKey]>,>(name: TKey) {
        return this._inputs?.find(a => a.name == name)?.content as TEditor;
    }

    protected override async commitAsyncWork() {

        let isSuccess = true;

        for (const input of this._inputs) {

            if (!await input.commitAsync())
                isSuccess = false;
        }

        if (webApp.debugEdit)
            console.log("commitAsyncWork", isSuccess);

        return isSuccess;
    }

    override async validateAsync<TTarget>(ctx?: IValidationContext<TTarget>,
        force?: boolean,
        noShowError = false): Promise<boolean> {

        let isValid = true;

        const innerCtx = {
            target: this.editValue
        } as IValidationContext<TObj>;

        if (this._inputs) {
            for (const input of this._inputs) {
                if (!await input.validateAsync(innerCtx, force, noShowError))
                    isValid = false;
            }
        }

        this.isValid = isValid;

        return isValid;
    }

    protected override editToValue(editValue: TObj, clone: boolean) {

        if (clone)
            return cloneObject(editValue);

        if (editValue == this.value)
            return editValue;

        const value = this.value ?? emptyObject("editToValue");
        Object.assign(value, editValue);
        return value;
    }

    protected override valueToEdit(value: TObj, clone: boolean) {

        let editValue = value;

        if (!editValue)
            editValue = emptyObject("valueToEdit");

        else if (clone)
            editValue = cloneObject(editValue);

        if (this.validationMode == "onInputChange" && this._inputs)
            this.validateAsync(undefined, false, true);

        return editValue;
    }

    protected onReady() {

        if (this.validationMode == "onInputChange")
            this.validateAsync(undefined, false, true);
    }

    isDynamic: boolean;

    validationMode: ObjectEditorValidationMode;

    builder: (builder: EditorBuilder<TObj, this>) => JSX.Element;

    inputField: Partial<IInputFieldOptions<unknown, TObj>>;

    readonly inputValue: TObj;

}

configureBindings(ObjectEditor, {
    "isValid": "two-ways",
    "builder": "action"
});

declare module "./EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        object<TValue extends ObjectLike>(value: BindExpression<TModel, TValue>, options?: IBuilderEditorOptions<TModel, TValue, IObjectEditorOptions<TValue>>);
    }
}

EditorBuilder.prototype.object = function (this: EditorBuilder<any, any>, value, options) {
    return this.editor(value, ObjectEditor, {
        style: ["vertical-label", "no-box"],
        ...options
    });
}

export function objectEditor<TObj extends {}>(builder: (builder: EditorBuilder<TObj, ObjectEditor<TObj>>) => ITemplate<TObj> | JSX.Element, options?: IObjectEditorOptions<TObj>) {
    return new ObjectEditor<TObj>({ ...options, builder });
}

export default ObjectEditor;