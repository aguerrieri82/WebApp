import { defineTemplate } from "./TemplateBuilder";

declare global {
    var __defineTemplate : typeof defineTemplate;
}

window.__defineTemplate = defineTemplate;