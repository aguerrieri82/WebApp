import { defineTemplate } from "./Templates";


declare global {
    var __defineTemplate : typeof defineTemplate;
}

window.__defineTemplate = defineTemplate;