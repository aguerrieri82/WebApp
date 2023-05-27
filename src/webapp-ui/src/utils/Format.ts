import { ITemplate, Services } from "@eusoft/webapp-core";
import { LocalString } from "../Types";
import { ILocalization, LOCALIZATION } from "../abstraction";

export function formatText(text: LocalString, ...args: any[]): string | ITemplate<unknown>  { 

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

    return replaceArgs(text, i => formatText(args[i]));
}

export function replaceArgs(value: string, args: Record<string, unknown> | { (key: string) : unknown }): string {

    if (!value)
        return;

    let map: { (key: string): unknown };

    if (typeof (args) != "function")
        map = key => args[key];
    else
        map = <any>args;

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