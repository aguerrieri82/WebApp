import { IPropertyChangedHandler, isObservableProperty } from "./abstraction/IObservableProperty";
import type { CatalogTemplate } from "./abstraction/ITemplateProvider";
import type { IComponent } from "./abstraction/IComponent";
import { enumOverrides, getTypeName } from "./ObjectUtils";
import { bindTwoWay, getOrCreateProp } from "./Properties";
import { toKebabCase } from "./StringUtils";
import type { IBound } from "./abstraction/IBound";
import type { Bindable, ComponentStyle, IComponentOptions } from "./abstraction/IComponentOptions";
import { Binder } from "./Binder";
import { IBindingContainer } from "./abstraction/IBindingContainer";

type CommonKeys<TSrc, TDst> = {
    [K in (keyof TSrc & keyof TDst & string) /*as TSrc[K] extends Bindable<TDst[K]> ? K : never*/]: TSrc[K]
};

type ChangeHandlers<T> = {
    [K in keyof T as K extends string ? `on${Capitalize<K>}Changed` : never]?: { (value: T[K], oldValue: T[K]): void }
}

interface ISubscription {
    unsubscribe(): void;
}

export abstract class Component<TOptions extends IComponentOptions = IComponentOptions> implements IComponent<TOptions>, IBindingContainer {

    protected _bounds: IBound[];

    protected _subscriptions: ISubscription[];

    protected _binder: Binder<this>;

    protected _isCleaning: boolean;

    constructor(options?: Partial<TOptions>) {

        this.configure(options);

        this.onChanged("style", () => this.updateClass());
    }

    bindTwoWays<T>(src: (model: this) => T, dst: (model: this) => T) {
            
        if (!this._binder)
            this._binder = new Binder(this);
        this._binder.bindTwoWays(src, dst);
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

        const result: ISubscription = {
            unsubscribe() {
                prop.unsubscribe(handler)
            }
        }

        if (!this._subscriptions)
            this._subscriptions = [];

        this._subscriptions.push(result);

        return result;
    }

    cleanBindings(cleanValue: boolean) {

        if (this._isCleaning)
            return;
             
        this._isCleaning = true;

        if (this._bounds) {
            for (const item of this._bounds)
                item.unbind();
            delete this._bounds;
        }

        if (this._subscriptions) {
            for (const item of this._subscriptions)
                item.unsubscribe();
            delete this._subscriptions;
        }

        if (this._binder) {
            this._binder.cleanBindings(cleanValue);
            delete this._binder;
        }

        this._isCleaning = false;
    }

    protected bindOptions<TKey extends keyof CommonKeys<TOptions, this>>(...keys: TKey[]) {

        if (!this.options)
            return;

        for (const key of keys) {

            const value = (key in this.options ? this.options[key] : undefined) as unknown as this[TKey];

            this.bindValue(key, value);
        }
    }

    protected bindValue<TKey extends keyof this & string, TValue extends this[TKey]>(key: TKey, value: Bindable<TValue>) {

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