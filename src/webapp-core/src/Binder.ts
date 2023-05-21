import type { ArrayElement } from "./abstraction";
import { IBindable, PARENT, USE } from "./abstraction/IBindable";
import type { BindExpression, BindValue, IGetter } from "./abstraction/IBinder";
import { isBindingContainer } from "./abstraction/IBindingContainer";
import { IObservableArrayHandler, isObservableArray } from "./abstraction/IObservableArray";
import type { IObservableProperty, IPropertyChangedHandler } from "./abstraction/IObservableProperty";
import { compareArray, forEachRev } from "./ArrayUtils";
import { WebApp } from "./Debug";
import { cleanProxy, Expression, IExpressionProp } from "./Expression";
import { getFunctionType } from "./ObjectUtils";
import { createObservableArray } from "./ObservableArray";
import { getOrCreateProp } from "./Properties";


interface IBindingSubscription<TSrc extends object | [], TValue> {

    source: TSrc;

    handler: TSrc extends [] ? IObservableArrayHandler<ArrayElement<TSrc>> : IPropertyChangedHandler<TValue>;

    property?: IObservableProperty<TValue>;

    name?: string;
}

type BindingActionMode = "exec-always" | "no-bind";

export interface IBinding<TModel, TValue = unknown> {

    lastValue: TValue;

    actionMode: BindingActionMode;

    refs: IExpressionProp[];

    value(model: TModel): TValue;

    action(newValue: TValue, oldValue?: TValue, isUpdate?: boolean, isClear?: boolean): void;

    subscriptions: IBindingSubscription<object | [], unknown>[];

    suspend: number;
}

type CleanAction = () => any;

export class Binder<TModel> {

    protected _bindings: IBinding<TModel>[] = [];
    protected _modelBinders: Binder<TModel>[] = [];
    protected _childBinders: Binder<unknown>[] = [];
    protected _cleanActions: CleanAction[] = [];
    protected _tag: string;
    constructor(model?: TModel) {

        this.updateModel(model);
    }

    protected onClean(action: CleanAction) {
        this._cleanActions.push(action);
    }


    protected register(binder: Binder<TModel>, tag?: string) {

        binder._tag = tag;
        this._modelBinders.push(binder);
    }

    protected getBindValue<TValue>(value: BindValue<TModel, TValue>): TValue {
        if (typeof value === "function")
            return (value as IGetter<TModel, TValue>)(this.model);
        return <TValue>value;
    }

    protected getBindingExpression<TValue>(binding: BindExpression<TModel, TValue>) {

        return Expression.build<TModel, TValue>(this.model, binding, {
            evaluate: true,
            customProps: {
                [PARENT]: () => this.findParentModel()
            }
        });
    }

    protected unsubscribeProp<TValue>(binding: IBinding<TModel, TValue>, source: object, propName: string) {

        const subIndex = binding.subscriptions.findIndex(a => a.source === source && a.name === propName);

        if (subIndex != -1) {
            const sub = binding.subscriptions[subIndex];
            sub.property.unsubscribe(sub.handler as IPropertyChangedHandler<TValue>);
            binding.subscriptions.splice(subIndex, 1);
        }
        else
            console.warn("Subscription for property ", propName, " not found in object ", source);


        if (isObservableArray(source)) {
            if (!binding.subscriptions.some(a => a.source == source && a.name)) {

                const subIndex = binding.subscriptions.findIndex(a => a.source === source && !a.property);
                if (subIndex != -1) {

                    const sub = binding.subscriptions[subIndex];
                    source.unsubscribe(sub.handler as IObservableArrayHandler<TValue>);
                    binding.subscriptions.splice(subIndex, 1);
                }
            }
        }
    }

    protected getBindingValue<TValue>(binding: IBinding<TModel, TValue>, subscribe = true) {

        const exp = this.getBindingExpression(binding.value);

        if (!exp)
            return;

        if (subscribe) {

            const refs = Array.from(exp.expression.references()).filter(a =>
                typeof a.value !== "function" &&
                typeof a.object !== "function");

            compareArray(binding.refs, refs, {

                equals: (a, b) => (a.object === b.object && a.propName === b.propName),

                onAdded: ref => {

                    if (Array.isArray(ref.object) && !isObservableArray(ref.object))
                        createObservableArray(ref.object);

                    if (ref.propName)
                        this.subscribe(ref.object, ref.propName, binding);
                },

                onRemoved: ref => {

                    if (ref.propName)
                        this.unsubscribeProp(binding, ref.object, ref.propName);
                }
            });

            binding.refs = refs;
        }

        return exp.value;
    }

    bindOneWay<TValue>(src: (model: TModel) => TValue, dst: (model: TModel) => TValue) {

        let curValue: TValue;

        this.bind(src, value => {

            if (value !== undefined)
                curValue = value;

            const dstProp = this.getBindingProperty(dst);
            if (dstProp)
                dstProp.set(curValue);
        });
    }

    bindTwoWays<TValue, TDestModel extends TModel|object>(src: BindValue<TModel, TValue>, dstModel: TDestModel, dst: BindExpression<TDestModel, TValue>, onChanged?: (value: TValue) => void): void { 

        let isBinding = false;

        let curValue: TValue;

        const realDst = (dstModel == this.model ? dst : (m: TModel & IBindable) => dst(m[USE](dstModel))) as BindExpression<TModel, TValue>;

        for (const bind of [src, realDst]) {

            this.bind(bind, value => {

                if (isBinding)
                    return;

                let isChanged = false;

                if (value !== undefined) {
                    isChanged = curValue !== value;
                    curValue = value;
                }

                if (curValue === undefined)
                    return;

                isBinding = true;
                try {
                    const dstProp = this.getBindingProperty(realDst);
                    const srcProp = this.getBindingProperty(src);
                    if (dstProp)
                        dstProp.set(curValue);
                    if (srcProp)
                        srcProp.set(curValue);

                    if (isChanged && onChanged)
                        onChanged(curValue);
                }
                finally {
                    isBinding = false;
                }
            }, "exec-always");
        }
    }

    protected executeBinding<TValue>(binding: IBinding<TModel, TValue>, isUpdate: boolean) {

        const bindValue = this.getBindingValue(binding);

        if (isUpdate && bindValue === binding.lastValue && binding.actionMode != "exec-always")
            return;

        binding.action(bindValue, binding.lastValue, isUpdate);

        binding.lastValue = bindValue;
    }

    bind<TValue>(value: BindValue<TModel, TValue>, action: (newValue: TValue, oldValue?: TValue, isUpdate?: boolean, isClear?: boolean) => void, actionMode?: BindingActionMode) {

        if (typeof value === "function" && getFunctionType(value) !== "class" && actionMode !== "no-bind") {

            const binding: IBinding<TModel, TValue> = {
                value: value as IGetter<TModel, TValue>,
                action: action,
                subscriptions: [],
                lastValue: undefined,
                suspend: 0,
                refs: [],
                actionMode
            };

            this._bindings.push(binding);

            if (WebApp.isDebug)
                WebApp.bindings.push(binding);

            this.executeBinding(binding, false);
        }
        else 
            action(value as TValue, undefined, false);
    }

    protected unsubscribeBinding(binding: IBinding<TModel>, cleanValue: boolean) {

        binding.subscriptions.forEach(sub => {

            if (isObservableArray(sub.source) && !sub.property) 
                sub.source.unsubscribe(sub.handler as IObservableArrayHandler<unknown>);

            if (sub.property)
                sub.property.unsubscribe(sub.handler as IPropertyChangedHandler<unknown>);
        });

        if (cleanValue && binding.lastValue) {
            binding.action(undefined, binding.lastValue, true, true);
            binding.lastValue = undefined;
        }

        binding.subscriptions = [];
    }

    protected subscribe(obj: unknown, propName: string, binding: IBinding<TModel>) {

        if (binding.subscriptions.some(a => a.source === obj && a.name === propName))
            return;

        if (isObservableArray(obj) && !binding.subscriptions.some(a => a.source === obj && !a.property)) {

            const handler: IObservableArrayHandler<unknown> = {
                onChanged: () => {

                    this.executeBinding(binding, true);
                }
            };

            obj.subscribe(handler); 

            binding.subscriptions.push({
                handler: handler,
                source: obj
            });

        }  

        if (propName === null || propName === undefined)
            return;

        const propDesc = Object.getOwnPropertyDescriptor(obj, propName);

        if ((!propDesc && Array.isArray(obj)) || (propDesc && !propDesc.writable && !propDesc.set)) {
            console.warn("Property ", propName, " for object ", obj, " not exists or is not writeable.");
            return;
        }

        if (typeof obj != "object") {
            console.warn("Try to access ", propName, " for not object type ", obj);
            return;
        }

        const prop = getOrCreateProp(obj, propName as keyof object);

        const handler: IPropertyChangedHandler<unknown> = (value, oldValue) => {

            if (binding.suspend > 0)
                return;

            binding.suspend++;
            try {

                this.executeBinding(binding, true);

                if (isObservableArray(obj)) {
                    obj.raise(a => a.onChanged && a.onChanged());
                    obj.raise(a => a.onItemReplaced && a.onItemReplaced(value, oldValue, parseInt(propName)));
                }
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

        if (typeof value !== "function")
            return undefined;

        const exp = this.getBindingExpression(value as BindExpression<TModel, TValue>);
        if (!exp)
            return;

        const prop = exp.expression.property();

        if (prop && prop.object)
            return getOrCreateProp(prop.object, prop.propName);

    }

    protected findParentModel() {
        let current = this.parent;
        while (current) {
            if (current.model != this.model)
                return current.model;
            current = current.parent;
        }
    }

    cleanBindings(cleanValue: boolean) {

        this._bindings.forEach(binding =>
            this.unsubscribeBinding(binding, cleanValue));

        this._modelBinders.forEach(binder =>
            binder.cleanBindings(cleanValue));

        this._childBinders.forEach(binder =>
            binder.cleanBindings(cleanValue));

        this._cleanActions.forEach(a => a());

        if (isBindingContainer(this.model))
            this.model.cleanBindings(cleanValue);

        if (WebApp.isDebug)
            WebApp.bindings = WebApp.bindings.filter(a => this._bindings.indexOf(a) === -1);

        this._modelBinders = [];
        this._bindings = [];
        this._childBinders = [];
        this._cleanActions = [];
    }

    updateModel(model: TModel) { 

        this.model = cleanProxy(model);

        forEachRev(this._bindings, binding => 
            this.executeBinding(binding, true));

        forEachRev(this._modelBinders, binder =>
            binder.updateModel(model));
    }
 
    model: TModel;

    parent: Binder<unknown>;
}
