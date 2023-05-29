import { IPropertyChangedHandler, isObservableProperty } from "./abstraction/IObservableProperty";
import type { CatalogTemplate } from "./abstraction/ITemplateProvider";
import { COMPONENT, IComponent, isComponent } from "./abstraction/IComponent";
import { enumOverrides, getTypeName, isClass, objectHierarchy } from "./utils/Object";
import { bindTwoWays, getOrCreateProp } from "./Properties";
import { toKebabCase } from "./utils/String";
import type { IBound } from "./abstraction/IBound";
import type { Bindable, ComponentStyle, IComponentOptions } from "./abstraction/IComponentOptions";
import { Binder } from "./Binder";
import { IBindingContainer } from "./abstraction/IBindingContainer";
import { IMountListener } from "./abstraction/IMountListener";
import { ITemplateContext } from "./abstraction/ITemplateContext";
import { IService, SERVICE_TYPE, ServiceType } from "./abstraction/IService";
import { IServiceProvider, ServiceContainer } from "./abstraction/IServiceProvider";
import type { CommonKeys } from "./abstraction/Types";

interface ISubscription {
    unsubscribe(): void;
}

export abstract class Component<TOptions extends IComponentOptions = IComponentOptions> implements IComponent<TOptions>, IBindingContainer, IMountListener, IServiceProvider {

    protected _bounds: IBound[];
    protected _subscriptions: ISubscription[];
    protected _binder: Binder<this>;
    protected _isCleaning: boolean;

    constructor() {

        this.options = {} as TOptions;
        this.init(Component);
    }

    protected init(caller: Function, options?: TOptions) {

        if (options) 
            Object.assign(this.options, options);

        if (caller != this.constructor)
            return;

        const upOptions = enumOverrides(this, "updateOptions" as any);

        for (const func of upOptions) 
            func.call(this);

        const inits = enumOverrides(this, "initWork" as any);

        for (const func of inits) {

            if (func != this.init)
                func.call(this);
        }
    }

    protected initWork() {

        this.onChanged("style", () => this.updateClass());

        this.onChanged("name", () => this.updateClass());
    }


    protected updateOptions() {

        this.bindOptions("style", "template", "name", "visible");
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

                this._bounds.push(bindTwoWays(dst, value));
            }
        }
        else
            this[key] = value;
    }

    protected updateClass() {

        const classes: ComponentStyle[] = [];

        const flat = (item: ComponentStyle) => {
            if (typeof item == "string")
                classes.push(item);
            else
                item.forEach(a => flat(a));
        }

        for (const type of objectHierarchy(this)) {

            if (type == Component)
                break;
            classes.push(toKebabCase(getTypeName(type)));
        } 

        if (this.style)
            flat(this.style);

        if (this.name)
            classes.push(toKebabCase(this.name)); 

        this.className = classes.join(" ");
    }

    provides<TServiceType extends ServiceType, TService extends IService<TServiceType>>(service: TService): void {

        const serviceType = service[SERVICE_TYPE] as TServiceType;

        (this as unknown as ServiceContainer<TServiceType, TService>)[serviceType] = service;
    }


    bindTwoWays<TValue, TDestModel extends object>(src: (model: this) => TValue, dstModel: TDestModel, dst: (model: TDestModel) => TValue) {

        if (!this._binder)
            this._binder = new Binder(this);
        this._binder.bindTwoWays(src, dstModel, dst);
    }


    bindOneWay<TValue, TDestModel extends object>(src: (model: this) => TValue, dstModel: TDestModel, dst: (model: TDestModel) => TValue) {

        if (!this._binder)
            this._binder = new Binder(this);
        this._binder.bindOneWay(src, dstModel, dst);
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

        console.debug("cleanBindings", getTypeName(this));

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
            this._binder.cleanBindings(cleanValue, true);
            delete this._binder;
        }

        this._isCleaning = false;
    }

    mount(ctx: ITemplateContext) {

        console.debug("mount", getTypeName(this));

        this.context = ctx as ITemplateContext<this, HTMLElement>;
    }

    unmount() {
        console.debug("unmount", getTypeName(this));
    }

    context: ITemplateContext<this, HTMLElement>;

    className: string;

    template: CatalogTemplate<this>;

    style: ComponentStyle;

    visible: boolean;

    options: TOptions;

    name?: string;

    model: never;
}

export function getComponent(obj: any): Function {

    if (!obj || typeof obj != "object")
        return undefined;

    if (isClass(obj.constructor) && isComponent(obj))
        return obj.constructor;

    if (COMPONENT in obj)
        return obj[COMPONENT];

    return undefined;
}
