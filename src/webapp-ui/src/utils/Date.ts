import { replaceArgs } from "./Format";

export function parseDate(value: Date | string): Date {

    if (!value)
        return null;

    if (value instanceof Date)
        return value;

    return new Date(value);
}

export function formatDate(date: Date | string, format: string, lang?: string) {
    date = parseDate(date);
    return replaceArgs(format, a => formatDateArgument(date, a, lang));
}

export function formatDateArgument(date: Date | string, arg: string, lang: string): string {

    if (!(date = parseDate(date)))
        return null;

    switch (arg) {
        case "D":
            return date.getDate().toString();
        case "DD":
            return date.getDate().toString().padStart(2, "0");
        case "W":
            return date.toLocaleDateString(lang, { weekday: "short" });
        case "WW":
            return date.toLocaleDateString(lang, { weekday: "long" });
        case "M":
            return date.getMonth().toString();
        case "MM":
            return (date.getMonth() + 1).toString().padStart(2, "0");
        case "MMM":
            return date.toLocaleDateString(lang, { month: "short" });
        case "MMMM":
            return date.toLocaleDateString(lang, { month: "long" });
        case "YY":
            return date.getFullYear().toString().substring(2, 4);
        case "YYYY":
            return date.getFullYear().toString();
        case "h":
            return date.getHours().toString();
        case "hh":
            return date.getHours().toString().padStart(2, "0");
        case "m":
            return date.getMinutes().toString();
        case "mm":
            return date.getMinutes().toString().padStart(2, "0");
        case "s":
            return date.getSeconds().toString();
        case "ss":
            return date.getSeconds().toString().padStart(2, "0");
        case "f":
            return (date.getMilliseconds() / 100).toString();
        case "ff":
            return (date.getMilliseconds() / 10).toString();
        case "fff":
            return date.getMilliseconds().toString();
    }
    return arg;
}