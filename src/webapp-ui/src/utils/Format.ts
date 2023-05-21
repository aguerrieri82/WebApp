import { LocalString } from "../Types";

//TODO implement

export function formatText(text: LocalString, ...args: any[]) : string {

    if (typeof text === "function")
        return text();

    return text;
}