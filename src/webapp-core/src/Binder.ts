import type { BindValue, IGetter } from "./Abstraction/IBinder";
import { IObservableArrayHandler, isObservableArray } from "./Abstraction/IObservableArray";
import type { IObservableProperty, IPropertyChangedHandler } from "./Abstraction/IObservableProperty";
import { forEachRev } from "./ArrayUtils";
import { createObservableArray } from "./ObservableArray";
import { getOrCreateProp } from "./Properties";

const IS_PROXY = Symbol("isProxy")

interface IBindingSubscription<TValue = any> {

    source: any;

    property: IObservableProperty<TValue>;

    handler: IPropertyChangedHandler<TValue> | IObservableArrayHandler<any>;

    name: string;
}

interface IBinding<TModel, TValue = any> {

    lastValue: TValue;

    value(model: TModel): TValue;

    action(newValue: TValue, oldValue?: TValue, isUpdate?: boolean, isClear?: boolean): void;

    subscriptions: IBindingSubscription[];

    suspend: number;
}

interface IPropertyAccess {
    obj: any;
    propName: string;
}

export class Binder<TModel> {

    private _bindings: IBinding<TModel>[] = [];
    private _modelBinders: Binder<TModel>[] = [];

    constructor(model?: TModel) {

        this.updateModel(model);
    }

    protected register(binder: Binder<TModel>) {

        this._modelBinders.push(binder);
    }


    protected getBindValue<TValue>(value: BindValue<TModel, TValue>): TValue {
        if (typeof value == "function")
            return (value as IGetter<TModel, TValue>)(this.model);
        return <TValue>value;
    }

    protected getBindingValue<TValue>(binding: IBinding<TModel, TValue>, subscribe = true) {

        return binding.value(this.createProxy(this.model, (obj, propName) => {
            if (subscribe) 
                this.subscribe(obj, propName, binding);
            return true;
        }));
    }

    bind<TValue>(value: BindValue<TModel, TValue>, action: (newValue: TValue, oldValue?: TValue, isUpdate?: boolean, isClear?: boolean) => void) {

        if (typeof value == "function") {

            const binding: IBinding<TModel, TValue> = {
                value: value as IGetter<TModel, TValue>,
                action: action,
                subscriptions: [],
                lastValue: undefined,
                suspend: 0
            };

            this._bindings.push(binding);

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

        if ((!propDesc && Array.isArray(obj)) || (!propDesc.writable && !propDesc.set)) {
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

                if (bindValue == binding.lastValue)
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

    protected getBindingProperty<TValue>(value: BindValue<TModel, TValue>): IObservableProperty<TValue> {

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

    protected createProxy<TObj>(obj: TObj, action: (obj: any, propName: string) => boolean): TObj {

        if (!obj || typeof (obj) !== "object"/* || (obj as any)[IS_PROXY]*/)
            return obj;

        const innerProxies: Record<PropertyKey, any> = {};

        if (Array.isArray(obj)) {

            if (!isObservableArray(obj))
                createObservableArray(obj);
        }

        return new Proxy(obj as Record<PropertyKey, any>, {

            get: (target, prop) => {

                if (prop === IS_PROXY)
                    return true; 

                if (prop === "@parent")
                    return this.createProxy(this.findParentModel(), action);

                if (typeof prop === "symbol" || typeof target[prop] === "function" || (Array.isArray(obj) && prop === "length")) 
                    return target[prop];

                //TODO investigate cache
                //if (!(prop in innerProxies)) {

                    if (action(obj, prop))
                        innerProxies[prop] = this.createProxy(target[prop], action);
                    else
                        innerProxies[prop] = target[prop];
               // }

                return innerProxies[prop];
            },

            set: (target, prop, value) => {

                if (target[prop] == value)
                    return;

                if (typeof prop === "symbol") 
                    return target[prop];

                if (action(obj, prop))
                    innerProxies[prop] = this.createProxy(target[prop], action);
                else
                    innerProxies[prop] = target[prop];
                
                target[prop] = value;

                return true;
            }
        }) as TObj;

    }

    protected cleanBindings(cleanValue: boolean) {

        this._bindings.forEach(binding =>
            this.unsubscribe(binding, cleanValue));

        this._modelBinders.forEach(binder =>
            binder.cleanBindings(cleanValue));

        this._modelBinders = [];
        this._bindings = [];
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
