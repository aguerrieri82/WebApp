import { type IPropertyChangedHandler, isObservableProperty } from "./abstraction/IObservableProperty";
import type { CatalogTemplate } from "./abstraction/ITemplateProvider";
import { COMPONENT, type IComponent, isComponent } from "./abstraction/IComponent";
import { enumOverrides, getTypeName, isClass, objectHierarchy, setTypeName } from "./utils/Object";
import { bindTwoWays, getOrCreateProp } from "./Properties";
import { generateRandomId, toKebabCase } from "./utils/String";
import type { IBound } from "./abstraction/IBound";
import type { Bindable, ComponentStyle, IComponentOptions } from "./abstraction/IComponentOptions";
import { Binder } from "./Binder";
import { type IBindingContainer } from "./abstraction/IBindingContainer";
import { type IMountListener } from "./abstraction/IMountListener";
import { type ITemplateContext } from "./abstraction/ITemplateContext";
import { type IService, SERVICE_TYPE, type ServiceType } from "./abstraction/IService";
import { type IServiceProvider, type ServiceContainer } from "./abstraction/IServiceProvider";
import type { CommonKeys } from "./abstraction/Types";
import { type BindExpression, type BindValue } from "./abstraction/IBinder";
import { type IHTMLContainer } from "./abstraction";
import { buildStyle } from "./utils/Style";

interface ISubscription {
    unsubscribe(): void;
}

export abstract class Component<TOptions extends IComponentOptions = IComponentOptions> implements IComponent<TOptions>, IBindingContainer, IMountListener, IServiceProvider, IHTMLContainer {

    protected _bounds: IBound[];
    protected _subscriptions: ISubscription[];
    protected _binder: Binder<this>;
    protected _isCleaning: boolean;

    constructor() {

        this.options = {} as TOptions;
        this.id = generateRandomId();
        this.init(Component);
    }

    protected init(caller: Function, options?: TOptions) {

        if (options) 
            Object.assign(this.options, options);

        if (caller != this.constructor)
            return;

        this.updateOptions();

        const inits = enumOverrides(this, "initProps" as any);

        for (const func of inits) {

            if (func != this.init)
                func.call(this);
        }

        
    }

    protected initProps() {

        this.onChanged("style", () => this.updateClass());

        this.onChanged("name", () => this.updateClass());
    }


    protected updateOptions() {

        const validKeys = Object.keys(this.options).filter(a => a in this);

        this.bindOptions(...validKeys as any);
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

        if (value === null || value === undefined)
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

        for (const type of objectHierarchy(this)) {

            if (type == Component)
                break;
            classes.push(toKebabCase(getTypeName(type)));
        } 

        if (this.name)
            classes.push(toKebabCase(this.name)); 

        this.className = buildStyle(classes, this.style);
    }

    provides<TServiceType extends ServiceType, TService extends IService<TServiceType>>(service: TService): void {

        const serviceType = service[SERVICE_TYPE] as TServiceType;

        (this as unknown as ServiceContainer<TServiceType, TService>)[serviceType] = service;
    }


    bindTwoWays<TValue, TDestModel extends object>(src: BindValue<this, TValue>, dstModel: TDestModel, dst: BindExpression<TDestModel, TValue>) {

        this.binder.bindTwoWays(src, dstModel, dst, "dstToSrc");
    }


    bindOneWay<TValue, TDestModel extends object>(dst: BindValue<this, TValue>, srcModel: TDestModel, src: BindExpression<TDestModel, TValue>) {

        this.binder.bindOneWay(dst, srcModel, src);
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

        if (this._isCleaning || this.isCacheEnabled)
            return;

        console.debug("cleanBindings", getTypeName(this));

        this._isCleaning = true;

        if (this._bounds) {
            for (const item of this._bounds)
                item.unbind();
            delete this._bounds;
        }

        
        /*
        TODO problem: if i unmoint a component and remount later i need to keep subs

        if (this._subscriptions) {
            for (const item of this._subscriptions)
                item.unsubscribe();
            delete this._subscriptions;
        }
        */

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

    get binder() {

        if (!this._binder)
            this._binder = new Binder(this);
        return this._binder;
    }

    nodes: Node[];

    isCacheEnabled: boolean;

    context: ITemplateContext<this, HTMLElement>;

    className: string;

    template: CatalogTemplate<this>;

    style: ComponentStyle;

    visible: boolean;

    options: TOptions;

    name?: string;

    model: never;

    id: string;
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

export function declareComponent<TOptions extends IComponentOptions, TType extends { new(...args: any[]): Component<TOptions> }>(type: TType, options: TOptions) {
    return class InlineComponent extends type {
        constructor(...args: any[]) {

            super(args[0]);

            this.init(InlineComponent, options);
        }
    } as TType;
}


export function registerComponent<T extends Component<unknown>>(ctr: { new(...args: any[]): T }, name: string) {
    setTypeName(ctr, name);
}