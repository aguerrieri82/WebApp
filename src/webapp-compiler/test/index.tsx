import { forModel } from "@eusoft/webapp-jsx";
import { EditorPropertyType, IEditorProperty } from "../abstraction/IEditorProperty";
import { LocalString } from "@eusoft/webapp-ui/Types";


class PropertyBuilder<THost, TProp> {

    readonly _host: THost;

    constructor(host: THost) {
        this._host = host;
    }

    value(get: (host: THost) => TProp, set: (value: TProp, host: THost) => void) {

        Object.defineProperty(this.property, "value", {
            get: () => get(this._host),
            set: v => set(v, this._host)
        });

        return this;
    }


    property = {} as IEditorProperty<TProp>;
}


class EditorPropertiesBuilder<TValue> {

    readonly _host: TValue;

    constructor(host: TValue) {
        this._host = host;
    }

    boolean(label: LocalString, build: (bld: PropertyBuilder<TValue, boolean>) => void) {
        const result = this.buildProperty("boolean", label, build);
        result.showLabel = false;
        if (!result.editor) {
            result.editor = forModel(result, m => <label>
                <input type="check" value={m.value} />
                <span>{m.label}</span>
            </label>);
        }
        return this;
    }

    protected buildProperty<TProp>(type: EditorPropertyType, label: LocalString, build: (bld: PropertyBuilder<TValue, TProp>) => void) {

        const builder = new PropertyBuilder<TValue, TProp>(this._host);

        builder.property.type = type;
        builder.property.label = label;

        build(builder);

        this.properties.push(builder.property);

        return builder.property;
    }


    properties: IEditorProperty<unknown>[] = [];
}


export function buildProps<TValue>(value: TValue, build: (bld: EditorPropertiesBuilder<TValue>) => void) {
    const builder = new EditorPropertiesBuilder<TValue>(value);
    build(builder);
    return builder.properties;
}