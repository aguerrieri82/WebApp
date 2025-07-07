import { Services } from "@eusoft/webapp-core";
import { LOCALIZATION, type ILocalization } from "../abstraction";
import { replaceArgs } from "./Format";
import { TimeSpan } from "../types/TimeSpan";

export function stringOrUndef(value: unknown) {
    if (typeof value == "string")
        return value;
    return undefined;
}

export function fixEndDate(date: Date | string) {
    if (!date)
        return;
    return new Date(parseDate(date).setHours(23, 59, 59, 999));
}

export function fixStartDate(date: Date | string) {
    if (!date)
        return;
    return new Date(parseDate(date).setHours(0, 0, 0, 0));
}

export function parseDate(value: Date | string): Date {

    if (!value)
        return null;

    if (value instanceof Date)
        return value;

    return new Date(value);
}

export function formatDate(date: Date | string, format: string, lang?: string) {

    date = parseDate(date);

    if (!date)
        return;

    if (!lang) {
        const local = Services[LOCALIZATION] as ILocalization;
        lang = local.language;
    }

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

export function dateAdd(date: Date | string, value: TimeSpan): Date {
    if (!(date = parseDate(date)))
        return null;
    return new Date(date.getTime() + value.ticks);
}

export function dateDiff(date1: Date | string, date2: Date | string): TimeSpan {
    return new TimeSpan(parseDate(date1).getTime() - parseDate(date2).getTime());
}

export function now(): Date {
    return new Date();
}

export function today(): Date {
    return truncateTime(now());
}

export function isSameDay(dateA: Date | string, dateB: Date | string): boolean {
    return truncateTime(dateA).getTime() == truncateTime(dateB).getTime();
}

export function truncateTime(date: Date | string): Date {
    if (!(date = parseDate(date)))
        return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function dayStart(date: Date | string): Date {
    if (!(date = parseDate(date)))
        return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
export function dayEnd(date: Date | string): Date {
    if (!(date = parseDate(date)))
        return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}