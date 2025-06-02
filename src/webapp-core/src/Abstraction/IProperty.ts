export interface IProperty<TValue> {

    get(): TValue;

    set(value: TValue): void;

    isAttribute?: boolean;

    readonly name: string;
}