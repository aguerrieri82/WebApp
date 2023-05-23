export interface IBindingContainer {

    cleanBindings(cleanValue: boolean): void;
}

export function isBindingContainer(value: any): value is IBindingContainer {

    return value && typeof value === "object" &&
        "cleanBindings" in value && typeof value["cleanBindings"] === "function";
}