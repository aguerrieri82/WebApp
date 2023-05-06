import { createElement } from "./Runtime";

export type * from "./Abstraction";
export * from "./Components";
export * from "./Helpers";

declare global {
    var _jsx : typeof createElement
}

window._jsx = createElement;
