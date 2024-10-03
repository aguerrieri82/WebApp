import { TemplateMap, BindExpression } from "@eusoft/webapp-core";
import { Class, forModel } from "@eusoft/webapp-jsx";
import { IEditorOptions } from "../../abstraction/IEditor";
import { EditorBuilder } from "../EditorBuilder";
import { Editor } from "../Editor";
import "./index.scss";

interface IRangeEditorOptions extends IEditorOptions<number> {

    min?: number;

    max?: number;

    step?: number;

    formatValue?: (value: number) => string;
}

export const RangeEditorTemplates: TemplateMap<RangeEditor> = {

    "Default": forModel(m => <div className={m.className} visible={m.visible}>
        <Class name="no-box" />
        <input disabled={m.disabled} value-mode="input" type="range" step={m.step?.toString()} min={m.min?.toString()} max={m.max?.toString()} value={m.editValue} >
        </input>
        <span>{m.formatValue(m.value)}</span> 
    </div>)
} 

export class RangeEditor extends Editor<number, IRangeEditorOptions> {

    constructor(options?: IRangeEditorOptions) {

        super();

        this.min = 0;
        this.max = 1;
        this.step = 0.01;

        this.init(RangeEditor, {
            template: RangeEditorTemplates.Default,
            ...options
        });
    }

    protected override initProps() {

        this.onChanged("editValue", v => {
            this.value = v ? parseFloat(v) : undefined;
        });

        this.onChanged("value", v => {
            this.editValue = (v === null || v === undefined) ? null : v.toString();
        });
    }

    formatValue(value: number) {
        return value?.toString() ?? "";    
    }

    min: number;

    max: number;

    step: number;

    editValue: string;
}


declare module "../EditorBuilder" {
    interface EditorBuilder<TModel, TModelContainer> {
        range(value: BindExpression<TModel, number>, options?: IBuilderEditorOptions<TModel, number, IRangeEditorOptions>);
    }
}

EditorBuilder.prototype.range = function (this: EditorBuilder<any, any>, value, options) {
    return this.editor(value, RangeEditor, options);
}

export default RangeEditor;