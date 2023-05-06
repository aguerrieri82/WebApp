import { createElement } from "./Runtime";

export type * from "./Abstraction";
export * from "./Components";

declare global {
    var _jsx : typeof createElement
}

window._jsx = createElement;
