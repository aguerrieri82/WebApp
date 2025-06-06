import { type IPropertyChangedHandler, isObservableProperty } from "./abstraction/IObservableProperty";
import type { CatalogTemplate } from "./abstraction/ITemplateProvider";
import { COMPONENT, type IComponent, type IComponentConstructor, isComponent } from "./abstraction/IComponent";
import { enumOverrides, getTypeName, isClass, objectHierarchy, setTypeName } from "./utils/Object";
import { attribute, bindTwoWays, getOrCreateProp } from "./Properties";
import { generateRandomId, toKebabCase } from "./utils/String";
import type { IBound } from "./abstraction/IBound";
import type {ComponentStyle, IComponentOptions } from "./abstraction/IComponentOptions";
import { Binder } from "./Binder";
import { type IBindingContainer } from "./abstraction/IBindingContainer";
import { type IMountListener } from "./abstraction/IMountListener";
import { type ITemplateContext } from "./abstraction/ITemplateContext";
import { type IService, SERVICE_TYPE, type ServiceType } from "./abstraction/IService";
import { type IServiceProvider, type ServiceContainer } from "./abstraction/IServiceProvider";
import { isExternalBind, type BindExpression, type BindValueUnchecked } from "./abstraction/IBinder";
import { type Bindable, type IHTMLContainer } from "./abstraction";
import { buildStyle } from "./utils/Style";
import { Bind } from "./Bind";

interface ISubscription {
    unsubscribe(): void;
}



export abstract class Component<
    TOptions extends IComponentOptions = IComponentOptions>
    implements IComponent<TOptions>,
        IBindingContainer,
        IMountListener,
        IServiceProvider,
        IHTMLContainer {

    protected _bounds: IBound[];
    protected _subscriptions: ISubscription[];
    protected _binder: Binder<this>;
    protected _isCleaning: boolean;

    constructor() {

        //this.isCacheEnabled = true;
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

            this._bounds ??= [];

            if (!this._bounds?.find(a => a.src == value && a.dst == dst))
                this._bounds.push(bindTwoWays(dst, value));
        }
        else if (isExternalBind<object, this[TKey]>(value)) {

            const dst = Bind.exp((a: this) => a[key]);

            if (value.mode == "two-ways") {
                this.bindTwoWays(dst, value.model, value.value);
            }
            else {
                this.bindOneWay(dst, value.model, value.value);
            }
        }
        else
            this[key] = value as TValue;
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


    bindTwoWays<TValue, TDestModel extends object>(
        src: BindValueUnchecked<this, TValue>,
        dstModel: TDestModel,
        dst: BindExpression<TDestModel, TValue>) {

        this.binder.bindTwoWays(src, dstModel, dst, "dstToSrc");
    }


    bindOneWay<TValue, TDestModel extends object>(
        src: BindValueUnchecked<this, TValue>,
        dstModel: TDestModel,
        dst: BindExpression<TDestModel, TValue>) {

        this.binder.bindOneWay(src, dstModel, dst);
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

        //TODO problem: if i unmoint a component and remount later i need to keep subs

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

    get binder() {

        if (!this._binder)
            this._binder = new Binder(this);
        return this._binder;
    }


    className: string;

    style: ComponentStyle;

    visible: boolean;

    name?: string;

    model: never;

    id: string;

    template: CatalogTemplate<this>;

    options: TOptions;

    nodes: Node[];

    isCacheEnabled: boolean;

    context: ITemplateContext<this, HTMLElement>;
}


export function getComponent(obj: unknown): Function {

    if (!obj || typeof obj != "object")
        return undefined;

    if (isClass(obj.constructor) && isComponent(obj))
        return obj.constructor;

    if (COMPONENT in obj)
        return obj[COMPONENT] as Function; 

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

/*
export function registerElement<TComponent extends IComponent>(component: Class<TComponent>, name?: string) {

    const element = class InlineComponent extends HTMLElement {

        private _model: TComponent;

        constructor() {
            super();

            this._model = new component();

            const attrs = this._model[ATTRIBUTES];

            console.log(attrs);

            for (const key of attrs) {

                Reflect.defineProperty(this, key, {
                    set: v => {
                        console.log("Set ", key, v);
                        this._model[key] = v;
                    },
                    get: () => this._model[key], 
                });
            }

        }

        connectedCallback() {

            let parentBuilder = getBuilder(this.parentElement);

            if (!parentBuilder) 
                parentBuilder = new TemplateBuilder(this._model, this.parentElement);

            parentBuilder.templateFor(this._model);

            console.log("connected");
        }

        connectedMoveCallback() {
            console.log("connectedMove");
        }

        disconnectedCallback() {

            console.log("disconnected");
        }

        adoptedCallback() {
            console.log("adopted");
        }

        attributeChangedCallback(name: string, oldValue: string, newValue: string) {

        }

        static get observedAttributes() {
            return ["color", "size"];
        }
    };

    name ??= toKebabCase(getTypeName(component));

    customElements.define("wa-" + name, element);

    return name;
}
*/