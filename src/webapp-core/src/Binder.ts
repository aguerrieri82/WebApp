import { type IBindable, INDEX, PARENT, USE } from "./abstraction/IBindable";
import type { BindDirection, BindExpression, BindValue, IGetter } from "./abstraction/IBinder";
import { isBindingContainer } from "./abstraction/IBindingContainer";
import { type IObservableArrayHandler, isObservableArray } from "./abstraction/IObservableArray";
import type { IObservableProperty, IPropertyChangedHandler } from "./abstraction/IObservableProperty";
import { compareArray, forEachRev } from "./utils/Array";
import { WebApp } from "./utils/Debug";
import { cleanProxy, Expression, type IExpressionBuild, type IExpressionProp } from "./Expression";
import { getFunctionType, getPropertyDescriptor } from "./utils/Object";
import { createObservableArray } from "./ObservableArray";
import { getOrCreateProp } from "./Properties";
import type { ArrayElement } from "./abstraction/Types";
import { isTemplate } from "./abstraction/ITemplate";

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
                [PARENT]: () => this.findParentModel(),
                [INDEX]: () => this.findIndex()
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
        else {
            //TODO check why
            if (Array.isArray(source) && propName == "length")
                return;
            console.warn("Subscription for property ", propName, " not found in object ", source);
        }

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
                !a.readonly &&
                typeof a.object == "object" &&
                typeof a.value !== "function");

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

    bindOneWay<TValue, TDestModel extends TModel | object>(dst: BindValue<TModel, TValue>, srcModel: TDestModel, src: BindExpression<TDestModel, TValue>): void { 

        let curValue: TValue;

        const realSrc = (srcModel == this.model ? dst : (m: TModel & IBindable) => src(m[USE](srcModel))) as BindExpression<TModel, TValue>;

        this.bind(realSrc, value => {

            if (value !== undefined)
                curValue = value;

            const dstProp = this.getBindingProperty(dst);
            if (dstProp)
                dstProp.set(curValue);
        });
    }

    bindTwoWays<TValue, TDestModel extends TModel|object>(src: BindValue<TModel, TValue>, dstModel: TDestModel, dst: BindExpression<TDestModel, TValue>, direction: BindDirection, onChanged?: (value: TValue) => void): void { 

        let isBinding = false;

        let curValue: TValue;

        let isFirstBinding = true;

        const realDst = (dstModel == this.model ? dst : (m: TModel & IBindable) => dst(m[USE](dstModel))) as BindExpression<TModel, TValue>;

        const binds = direction == "dstToSrc" ? [realDst, src] : [src, realDst];

        for (const bind of binds) {

            this.bind(bind, (value, oldValue, isUpdate, isClear) => {

                if (isBinding || isClear)
                    return;

                let isChanged = false;

                if (value !== undefined || !isFirstBinding) {
                    isChanged = curValue !== value;
                    curValue = value;
                }

                if (curValue === undefined && isFirstBinding)
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
            });
        }

        isFirstBinding = false;
    }

    protected executeBinding<TValue>(binding: IBinding<TModel, TValue>, isUpdate: boolean) {

        const bindValue = this.getBindingValue(binding);

        if (isUpdate && bindValue === binding.lastValue && binding.actionMode != "exec-always")
            return;

        binding.action(bindValue, binding.lastValue, isUpdate);

        binding.lastValue = bindValue;
    }

    bind<TValue>(value: BindValue<TModel, TValue>, action: (newValue: TValue, oldValue?: TValue, isUpdate?: boolean, isClear?: boolean) => void, actionMode?: BindingActionMode) {

        if (typeof value === "function" && getFunctionType(value) !== "class" && actionMode !== "no-bind" && !isTemplate(value)) {

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

        const propDesc = getPropertyDescriptor(obj as object, propName);

        if (propDesc && (!propDesc.configurable)) {
            if (!Array.isArray(obj))
                console.warn("Property ", propName, " for object ", obj, " is not observable.");
            return;
        }

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

    protected execForSubBinders<TBinder extends Binder<unknown> = this>(action: (binder: TBinder) => void, includeSelf: boolean) {

        const allBinders = [...this._childBinders, ...this._modelBinders] as TBinder[];

        if (includeSelf)
            action(this as unknown as TBinder);

        for (const binder of allBinders) {
            binder.execForSubBinders(action, false);
            action(binder);
        }
    }

    isRootModel() {
        let curParent = this.parent;
        while (curParent) {
            if (curParent.model == this.model)
                return false;
            curParent = curParent.parent;
        }
        return true;
    }

    cleanBindings(cleanValue: boolean, deep: boolean) {

        this._bindings.forEach(binding =>
            this.unsubscribeBinding(binding, cleanValue));

        this._cleanActions.forEach(a => a());

        if (isBindingContainer(this.model) && this.isRootModel()) //TODO very weak, to rethnk
            this.model.cleanBindings(cleanValue);

        if (WebApp.isDebug)
            WebApp.bindings = WebApp.bindings.filter(a => this._bindings.indexOf(a) === -1);

        this._modelBinders = [];
        this._bindings = [];
        this._childBinders = [];
        this._cleanActions = [];

        if (deep)
            this.execForSubBinders(binder => binder.cleanBindings(cleanValue, true), false);
    }

    updateModel(model: TModel, deep = false) { 

        const curModel = this.model;

        model = cleanProxy(model);

        if (model === curModel) 
            return;


        this.model = model;

        forEachRev(this._bindings, binding => 
            this.executeBinding(binding, true));

        if (deep) {
            this.execForSubBinders(binder => {
                if (binder.model == curModel)
                    binder.updateModel(model, true)
            }, false);
        }
        else {
            forEachRev(this._modelBinders, binder =>
                binder.updateModel(model));
        }

        
    }

    protected findIndex() {

        let curBuilder = this as Binder<unknown>;

        while (curBuilder) {
            if (curBuilder.index != -1)
                return curBuilder.index;
            curBuilder = curBuilder.parent;
        }
    }
 
    model: TModel;

    parent: Binder<unknown>;

    index: number = -1;
}
