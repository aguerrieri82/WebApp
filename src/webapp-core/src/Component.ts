import { IPropertyChangedHandler, isObservableProperty } from "./Abstraction/IObservableProperty";
import type { CatalogTemplate } from "./Abstraction/ITemplateProvider";
import type { IComponent } from "./Abstraction/IComponent";
import { enumOverrides, getTypeName } from "./ObjectUtils";
import { bindTwoWay, getOrCreateProp } from "./Properties";
import { toKebabCase } from "./StringUtils";
import type { IBound } from "./Abstraction/IBound";
import type { Bindable, ComponentStyle, IComponentOptions } from "./Abstraction/IComponentOptions";

type CommonKeys<TSrc, TDst> = {
    [K in (keyof TSrc & keyof TDst & string) /*as TSrc[K] extends Bindable<TDst[K]> ? K : never*/]: TSrc[K]
};

export class Component<TOptions extends IComponentOptions = IComponentOptions> implements IComponent<TOptions> {

    protected _bounds: IBound[];

    constructor(options?: Partial<TOptions>) {

        this.configure(options);

        this.onChanged("style", () => this.updateClass());
    }

    protected configure(newOptions?: Partial<TOptions>) {

        if (!newOptions)
            return;

        this.options = {
            ...this.options,
            ...newOptions
        }

        const updates = enumOverrides(this, "updateOptions" as any);

        for (const func of updates)
            func.call(this);
    }

    protected updateOptions() {

        this.bindOptions("style", "template");
    }

    prop<TKey extends keyof this & string>(prop: TKey) {

        return getOrCreateProp(this, prop);
    }

    onChanged<TKey extends keyof this & string>(propName: TKey, handler: IPropertyChangedHandler<this[TKey]>) {

        const prop = this.prop(propName);

        prop.subscribe(handler);

        handler(prop.get(), undefined);

        return {
            remove() {
                prop.unsubscribe(handler)
            }
        }
    }

    unmount() {
        if (this._bounds) {
            for (const item of this._bounds)
                item.unbind();
            delete this._bounds;
        }
    }

    protected bindOptions<TKey extends keyof CommonKeys<TOptions, this>>(...keys: TKey[]) {

        if (!this.options)
            return; 

        for (const key of keys) {

            const value = (key in this.options ? this.options[key] : undefined) as unknown as this[TKey];

            this.bind(key, value);
        }
    }

    protected bind<TKey extends keyof this & string, TValue extends this[TKey]>(key: TKey, value: Bindable<TValue>) {

        if (value === null && value === undefined)
            return;

        if (isObservableProperty(value)) {

            const dst = this.prop(key);

            if (!this._bounds?.find(a => a.src == value && a.dst == dst)) {

                if (!this._bounds)
                    this._bounds = [];

                this._bounds.push(bindTwoWay(dst, value));
            }
        }
        else
            this[key] = value;
    }

    protected updateClass() {

        this.className = [toKebabCase(getTypeName(this)), ...this.style ?? []].flat().join(" ");
    }

    className: string;

    template: CatalogTemplate<this>;

    style: ComponentStyle;

    options: TOptions;
}