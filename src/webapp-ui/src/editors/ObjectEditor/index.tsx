import { ITemplate, TemplateMap, renderOnce, withCleanup } from "@eusoft/webapp-core";
import { Content, Template, forModel } from "@eusoft/webapp-jsx";
import { IEditorOptions } from "../../abstraction/IEditor";
import { EditorBuilder } from "../EditorBuilder";
import { Editor } from "../Editor";
import { InputField } from "../../components";
import { IValidable } from "../../abstraction/IValidable";
import { ViewNode } from "../../Types";
import { IValidationContext } from "../../abstraction/Validator";

interface IObjectEditorOptions<TObj extends Record<string, any>> extends IEditorOptions<TObj> {

    builder: (builder: EditorBuilder<TObj, ObjectEditor<TObj>>) => ITemplate<TObj> | JSX.Element;

    isDynamic?: boolean;
}

export const ObjectEditorTemplates: TemplateMap<ObjectEditor<any>> = {

    "Default": forModel(m => <Template name="ObjectEditor">
        <div className={m.className} visible={m.visible} > 
            <Content src={m.value} template={m.contentTemplate()}/>
        </div>
    </Template>)
}

export class ObjectEditor<TObj extends Record<string, any>> extends Editor<TObj, IObjectEditorOptions<TObj>> implements IValidable  {

    protected _editors: InputField<any, any>[];
    protected _isDirty: boolean;
    protected _contentTemplate: ITemplate<TObj>;

    constructor(options?: IObjectEditorOptions<TObj>) {

        super();

        this.configure({
            ...options,
            template: ObjectEditorTemplates.Default
        });
    }

    protected updateOptions() {

        this.bindOptions("builder", "isDynamic");
    }

    contentTemplate() { 

        if (!this._contentTemplate || this.isDynamic) {

            const innerTemplate = this.builder(new EditorBuilder({
                container: this,
                model: a => a.value,
                attach: editor => {
                    this._editors.push(editor);
                    editor.onChanged("value", v => {
                        this._isDirty = true;
                    });
                }
            })) as ITemplate<TObj>;

            this._contentTemplate = withCleanup(innerTemplate, () => this._editors = []);
        }

        return this._contentTemplate;
    }

    async validateAsync<TTarget>(ctx?: IValidationContext<TTarget>, force?: boolean): Promise<boolean> {

        let isValid = true;

        const innerCtx = {
            target: this.value
        } as IValidationContext<TObj>;

        for (const editor of this._editors) {
            if (!await editor.validateAsync(innerCtx, force))
                isValid = false;
        }

        this.isValid = isValid;

        this._isDirty = false;

        return isValid;
    }

    error: ViewNode;

    isValid: boolean;

    isDynamic: boolean;

    builder: (builder: EditorBuilder<TObj, this>) => JSX.Element;
}

export default ObjectEditor;