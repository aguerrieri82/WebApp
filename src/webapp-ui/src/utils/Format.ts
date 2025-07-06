import { type ITemplate, Services, toKebabCase } from "@eusoft/webapp-core";
import { type TimeSpan, type Enum, type EnumValue, type LocalString } from "../types";
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
            return content;
    }

    return text;
}

export function hasLocal(label: string) {
    const local = Services[LOCALIZATION] as ILocalization;
    return local.has(label);
}

export function formatString(text: LocalString, ...args: any[]): string {
    return formatText(text, ...args) as string;
}

export function formatText(text: LocalString, ...args: any[]): string | ITemplate<unknown>  { 

    const simple = formatTextSimple(text, ...args);

    if (typeof simple != "string")
        return simple;

    return replaceArgs(simple, arg => {
        if (!isNaN(parseInt(arg)))
            return formatText(args[arg], args);
        return formatText(arg, args);  
    }); 
}
 
export function formatEnum<TEnum extends Enum>(obj: TEnum, value: EnumValue<TEnum>, prefix = "enum") {

    const text = typeof value == "number" ? obj[value] as string : value as string;
    const key1 = toKebabCase(text);
    const key2 = prefix + "-" + key1;
    return formatText(hasLocal(key2) ? key2 : key1);
}

export function formatCurrency(value: number, symbol = "€") {

    if (value === null || value === undefined)
        return "";
    return symbol + " " + (Math.round(value * 100) / 100).toFixed(2);
}

export function ellapsed(span: TimeSpan, direction: number): string {

    let text: string;

    if (span.totalDays > 1) {
        if (Math.round(span.totalDays) == 1)
            text = formatString("one-day");
        else
            text = Math.round(span.totalDays) + " " + formatString("days");

        if (direction == 0)
            text = formatString("from-time") + " " + text;
        else if (direction == -1)
            text += " " + formatString("ago-time");
        else
            text = formatString("in-time") + " " + text;
    }

    else if (span.totalHours > 1) {
        if (Math.round(span.totalHours) == 1)
            text = formatString("one-hour");
        else
            text = Math.round(span.totalHours) + " " + formatString("hours");

        if (direction == 0)
            text = formatString("from-time") + " " + text;
        else if (direction == -1)
            text += " " + formatString("ago-time");
        else
            text = formatString("in-time") + " " + text;
    }

    else if (span.totalMinutes < 2) {
        if (direction == 0)
            text = formatString("now-time");
        else if (direction == -1)
            text = formatString("few-time-ago");
        else
            text = formatString("in-few-time");
    }
    else {
        text = Math.round(span.totalMinutes) + " " + formatString("minutes");

        if (direction == 0)
            text = formatString("from-time") + " " + text;
        else if (direction == -1)
            text += " " + formatString("ago-time");
        else
            text = formatString("in-time") + " " + text;
    }

    return text;
}

export function replaceArgs(value: string, args: ObjectLike | { (key: string) : unknown }): string {

    if (!value)
        return;

    let map: { (key: string): unknown };

    if (typeof (args) != "function")
        map = key => args[key];
    else
        map = args as typeof map;

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
