import { createElement } from "./Runtime";

export type * from "./Abstraction";
export * from "./Components";

declare global {
    var __createElement : typeof createElement
}

window.__createElement = createElement;