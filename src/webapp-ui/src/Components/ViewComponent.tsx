import { getTypeName, CatalogTemplate, IObservableProperty, IViewComponent, getOrCreateProp, bindTwoWay, isObservableProperty, IPropertyChangedHandler } from "@eusoft/webapp-core";
import { toKebabCase } from "../Utils";

export type ComputedValue<TValue> = { (): TValue }

export type ComponentStyle = string | ComponentStyle[];

export type Bindable<TValue> = TValue | IObservableProperty<TValue>/* | ComputedValue<TValue>*/;

type CommonKeys<TSrc, TDst> = {
    [K in (keyof TSrc & keyof TDst & string) /*as TSrc[K] extends Bindable<TDst[K]> ? K : never*/]: TSrc[K]
};

export interface IComponentOptions {

    style?: Bindable<ComponentStyle>;

    template?: CatalogTemplate<any>;
}

function isComputedValue(value: any): value is ComputedValue<any> {

    return value && typeof value == "function" && (value as Function).length == 0;
}

export class ViewComponent<TOptions extends IComponentOptions = IComponentOptions> implements IViewComponent {
    constructor(options?: TOptions) {

        this.options = options;   

        this.bindOptions("style", "template");

        this.onChanged("style", () => this.updateClass());

        this.updateClass();
    }

    onChanged<TKey extends keyof this & string>(prop: TKey, handler: IPropertyChangedHandler<this[TKey]>) {

        getOrCreateProp(this, prop).subscribe(handler);

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

            bindTwoWay(getOrCreateProp(this, key), value);
        }
        /* //TODO compueedValue vs function
        else if (isComputedValue(value)) {

            this[key] = value();
        }*/
        else
            this[key] = value;
    }

    protected updateClass() {

        this.className = [toKebabCase(getTypeName(this)), ...this.style ?? []].flat().join(" ");
    }

    className: string;

    template: CatalogTemplate<this>;

    style: ComponentStyle;

    readonly options: TOptions;
}