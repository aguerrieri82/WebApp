export interface IProperty<TValue> {

    get(): TValue;

    set(value: TValue): void;

    readonly name: string;
}