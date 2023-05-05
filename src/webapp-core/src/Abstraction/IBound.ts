import type { IObservableProperty } from "./IObservableProperty";

export interface IBound {

    src: IObservableProperty<any>;

    dst: IObservableProperty<any>;

    unbind(): void;
}
