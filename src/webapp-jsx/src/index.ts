import { createElement } from "./Runtime";

export type * from "./abstraction";
export * from "./components";
export * from "./Helpers";

declare global {
    var _jsx : typeof createElement
}

window._jsx = createElement;
