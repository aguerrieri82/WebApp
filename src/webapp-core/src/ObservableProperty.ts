import { IObservableProperty, IPropertyChangedHandler } from "./Abstraction/IObservableProperty";
import { forEachRev } from "./ArrayUtils";

export class ObservableProperty<TValue = any> implements IObservableProperty<TValue> {

    private _handlers: IPropertyChangedHandler<TValue>[];
    private _descriptor: PropertyDescriptor;

    constructor(desc: PropertyDescriptor, name: string) {
        this._descriptor = desc;
        this.name = name;
    }

    get(): TValue {
        if (this._descriptor.get)
            return this._descriptor.get();
        return this._descriptor.value;
    }

    set(value: TValue) {

        const oldValue = this.get(); 
         
        if (this._descriptor.set)
            this._descriptor.set(value);
        else
            this._descriptor.value = value;

        if (oldValue !== value && this._handlers) {
            forEachRev(this._handlers, handler =>
                handler(value, oldValue));
        }
    }

    notifyChanged() {

        const value = this.get();

        forEachRev(this._handlers, handler =>
            handler(value, undefined));
    }

    subscribe(handler: IPropertyChangedHandler<TValue>) {

        if (!this._handlers)
            this._handlers = [];
        const index = this._handlers.indexOf(handler);
        if (index == -1)
            this._handlers.push(handler);
        return handler;
    }

    unsubscribe(handler: IPropertyChangedHandler<TValue>) {

        if (!this._handlers)
            return;
        const index = this._handlers.indexOf(handler);
        if (index != -1)
            this._handlers.splice(index, 1);
    }


    readonly name: string;
}