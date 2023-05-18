import { PARENT, TARGET, USE } from "./abstraction/IBindable";
import type { BindValue, IGetter } from "./abstraction/IBinder";
import { IObservableArrayHandler, isObservableArray } from "./abstraction/IObservableArray";
import type { IObservableProperty, IPropertyChangedHandler } from "./abstraction/IObservableProperty";
import { forEachRev } from "./ArrayUtils";
import { WebApp } from "./Debug";
import { getFunctionType } from "./ObjectUtils";
import { createObservableArray } from "./ObservableArray";
import { getOrCreateProp } from "./Properties";

interface IBindingSubscription<TValue = any> {

    source: any;

    property: IObservableProperty<TValue>;

    handler: IPropertyChangedHandler<TValue> | IObservableArrayHandler<any>;

    name: string;
}

export interface IBinding<TModel, TValue = any> {

    lastValue: TValue;

    execAlways: boolean;

    value(model: TModel): TValue;

    action(newValue: TValue, oldValue?: TValue, isUpdate?: boolean, isClear?: boolean): void;

    subscriptions: IBindingSubscription[];

    suspend: number;
}

interface IPropertyAccess {
    obj: any;
    propName: string;
}

type CleanAction = () => any;


function cleanProxy<TObj>(obj: TObj): TObj{

    if (obj && typeof obj === "object") {
        const target = (obj as any)[TARGET];
        if (target)
            return target as TObj;
    }

    return obj;
}

export function createProxy<TObj>(obj: TObj, action?: (obj: any, propName: string) => boolean, customProps?: Record<string | symbol, { () : any }>): TObj {

    if (!obj || typeof (obj) !== "object")
        return obj;

    obj = cleanProxy(obj);

    const innerProxies: Record<PropertyKey, any> = {};

    if (Array.isArray(obj)) {

        if (!isObservableArray(obj))
            createObservableArray(obj);
    }

    return new Proxy(obj as Record<PropertyKey, any>, {

        get: (target, prop) => {

            if (prop === TARGET)
                return target;

            if (customProps && prop in customProps)
                return createProxy(customProps[prop](), action);
  
            const value = target[prop];

            if (typeof prop === "symbol" || typeof value === "function" || (Array.isArray(obj) && prop === "length"))
                return value;

            if (!(prop in innerProxies)) {

                if (!action || action(obj, prop))
                    innerProxies[prop] = createProxy(value, action);
                else
                    innerProxies[prop] = value;
            }

            return innerProxies[prop];
        },

        set: (target, prop, value) => {

            value = cleanProxy(value);

            if (target[prop] === value)
                return;

            target[prop] = value;

            if (typeof prop === "symbol")
                return true;

            if (!action || action(obj, prop))
                innerProxies[prop] = createProxy(value, action);
            else
                innerProxies[prop] = value;

            return true;
        },
        
    }) as TObj;
}

export class Binder<TModel> {

    protected _bindings: IBinding<TModel>[] = [];
    protected _modelBinders: Binder<TModel>[] = [];
    protected _childBinders: Binder<any>[] = [];
    protected _cleanActions: CleanAction[] = [];
    protected _tag: string;
    constructor(model?: TModel) {

        this.updateModel(cleanProxy(model));
    }

    protected onClean(action: CleanAction) {
        this._cleanActions.push(action);
    }

    protected createProxy<TObj>(obj: TObj, action?: (obj: any, propName: string) => boolean) {

        return createProxy(obj, action, {

            [PARENT]: () => this.findParentModel(),
            [USE]: () => (value: any) => this.createProxy(value, action)
        });
    }

    protected register(binder: Binder<TModel>, tag?: string) {

        binder._tag = tag;
        this._modelBinders.push(binder);
    }

    protected getBindValue<TValue>(value: BindValue<TModel, TValue>): TValue {
        if (typeof value == "function")
            return (value as IGetter<TModel, TValue>)(this.model);
        return <TValue>value;
    }

    protected getBindingValue<TValue>(binding: IBinding<TModel, TValue>, subscribe = true) {

        const result = binding.value(this.createProxy(this.model, (obj, propName) => {
            if (subscribe) 
                this.subscribe(obj, propName, binding);
            return true;
        }));

        return cleanProxy(result);
    }

    bind<TValue>(value: BindValue<TModel, TValue>, action: (newValue: TValue, oldValue?: TValue, isUpdate?: boolean, isClear?: boolean) => void, execAlways = false) {

        if (typeof value == "function" && getFunctionType(value) != "class") {

            const binding: IBinding<TModel, TValue> = {
                value: value as IGetter<TModel, TValue>,
                action: action,
                subscriptions: [],
                lastValue: undefined,
                suspend: 0,
                execAlways
            };

            this._bindings.push(binding);

            if (WebApp.isDebug)
                WebApp.bindings.push(binding);

            const bindValue = this.getBindingValue(binding);
            
            binding.action(bindValue, undefined, false);

            binding.lastValue = bindValue;
        }
        else 
            action(value as TValue, undefined, false);
    }

    protected unsubscribe(binding: IBinding<TModel>, cleanValue: boolean) {

        binding.subscriptions.forEach(sub => {

            if (isObservableArray(sub.source)) 
                sub.source.unsubscribe(sub.handler as IObservableArrayHandler<any>);

            if (sub.property)
                sub.property.unsubscribe(sub.handler as IPropertyChangedHandler<any>);
        });

        if (cleanValue && binding.lastValue) {
            binding.action(null, binding.lastValue, true, true);
            binding.lastValue = null;
        }

        binding.subscriptions = [];
    }

    protected subscribe(obj: any, propName: string, binding: IBinding<TModel>) {

        for (let i = 0; i < binding.subscriptions.length; i++) {
            const sub = binding.subscriptions[i];
            if (sub.source == obj && sub.name == propName)
                return;
        }

        if (isObservableArray(obj)) {

            const handler: IObservableArrayHandler<any> = {
                onChanged: () => {
                     
                    const bindValue = this.getBindingValue(binding);

                    if (bindValue == binding.lastValue)
                        return;

                    binding.action(bindValue, binding.lastValue, true);

                    binding.lastValue = bindValue; 
                }
            };

            obj.subscribe(handler); 
        }  


        const propDesc = Object.getOwnPropertyDescriptor(obj, propName);

        if ((!propDesc && Array.isArray(obj)) || (propDesc && !propDesc.writable && !propDesc.set)) {
            console.warn("Property ", propName, " for object ", obj, " not exists or is not writeable.");
            return;
        }

        const prop = getOrCreateProp(obj, propName);

        const handler: IPropertyChangedHandler<any> = (value, oldValue) => {

            if (binding.suspend > 0)
                return;

            binding.suspend++;
            try {
                const bindValue = this.getBindingValue(binding, false);

                if (bindValue == binding.lastValue && !binding.execAlways)
                    return;

                this.unsubscribe(binding, false);

                this.getBindingValue(binding);

                binding.action(bindValue, binding.lastValue, true);

                if (isObservableArray(obj)) {
                    obj.raise(a => a.onChanged && a.onChanged());
                    obj.raise(a => a.onItemReplaced && a.onItemReplaced(value, oldValue, parseInt(propName)));
                }

                binding.lastValue = bindValue;
            }
            finally {
                binding.suspend--;
            }
        };

        prop.subscribe(handler);

        binding.subscriptions.push({
            source: obj,
            property: prop,
            name: propName,
            handler: handler
        }); 
    }

    getBindingProperty<TValue>(value: BindValue<TModel, TValue>): IObservableProperty<TValue> {

        if (typeof value != "function")
            return null;

        let lastProp: IPropertyAccess;

        (value as IGetter<TModel, TValue>)(this.createProxy(this.model, (obj, propName) => {
            lastProp = {
                obj: obj,
                propName: propName
            }
            return true;
        }));

        if (lastProp && lastProp.obj)
            return getOrCreateProp(lastProp.obj, lastProp.propName);
    }

    protected findParentModel() {
        let current = this.parent;
        while (current) {
            if (current.model != this.model)
                return current.model;
            current = current.parent;
        }
    }

    protected cleanBindings(cleanValue: boolean) {

        this._bindings.forEach(binding =>
            this.unsubscribe(binding, cleanValue));

        this._modelBinders.forEach(binder =>
            binder.cleanBindings(cleanValue));

        this._childBinders.forEach(binder =>
            binder.cleanBindings(cleanValue));

        this._cleanActions.forEach(a => a());

        if (WebApp.isDebug)
            WebApp.bindings = WebApp.bindings.filter(a => this._bindings.indexOf(a) == -1);

        this._modelBinders = [];
        this._bindings = [];
        this._childBinders = [];
        this._cleanActions = [];
    }

    updateModel(model: TModel) { 

        this.model = model;

        forEachRev(this._bindings, binding => {
            const value = this.getBindingValue(binding);
            if (binding.lastValue == value)
                return;
            binding.action(value, binding.lastValue, true)
            binding.lastValue = value;
        });

        forEachRev(this._modelBinders, binder =>
            binder.updateModel(model));
    }

 
    model: TModel;

    parent: Binder<any>;
}
