import type { IObservableProperty } from "./IObservableProperty";

export interface IBound {

    src: IObservableProperty<unknown>;

    dst: IObservableProperty<unknown>;

    unbind(): void;
}
