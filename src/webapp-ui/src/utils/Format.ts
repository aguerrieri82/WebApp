import { type ITemplate, Services } from "@eusoft/webapp-core";
import { type LocalString } from "../Types";
import { type ILocalization, LOCALIZATION } from "../abstraction";

export function formatTextSimple(text: LocalString, ...args: any[]) {

    if (typeof text === "function")
        return text();

    const local = Services[LOCALIZATION] as ILocalization;

    if (local) {

        const content = local.getContent(text);

        if (typeof content == "function")
            return content(args) as ITemplate<unknown>;

        if (typeof content == "string")
            text = content;
    }

    return text;
}

export function formatText(text: LocalString, ...args: any[]): string | ITemplate<unknown>  { 

    const simple = formatTextSimple(text, ...args);
    if (typeof simple != "string")
        return simple;
    return replaceArgs(simple, i => formatText(args[i])); 
}

export function formatCurrency(value: number) {

    return (Math.round(value * 100) / 100).toFixed(2);
}

export function replaceArgs(value: string, args: Record<string, unknown> | { (key: string) : unknown }): string {

    if (!value)
        return;

    let map: { (key: string): unknown };

    if (typeof (args) != "function")
        map = key => args[key];
    else
        map = args;

    let state = 0;
    let result = "";
    let curName = "";

    for (let i = 0; i < value.length; i++) {
        const c = value[i];
        switch (state) {
            case 0:
                if (c == "{") {
                    curName = "";
                    state = 1;
                }
                else
                    result += c;
                break;
            case 1:
                if (c == "}" || c == ":" || c == "=") {
                    state = 0;

                    if (args)
                        result += map(curName);

                    if (c == ":" || c == "=")
                        state = 2;
                    else
                        state = 0;
                }
                else if (c != "?")
                    curName += c;
                break;
            case 2:
                if (c == "}")
                    state = 0;
                break;
        }
    }

    return result;
}