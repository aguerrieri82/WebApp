import type { Bindable } from "@eusoft/webapp-core"

interface ISubscribeOptions<T> {
    value: Bindable<T>;
    handler: (value: T) => unknown;
}

export function Subscribe<T>(options: ISubscribeOptions<T>) {

    options.handler(options.value as T);
}