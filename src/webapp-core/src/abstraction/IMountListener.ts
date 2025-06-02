import { type ITemplateContext } from "./ITemplateContext";

export interface IMountListener {

    mount(ctx: ITemplateContext) : void;

    unmount(): void;
}

export function isMountListener(obj: unknown): obj is IMountListener {

    return obj && typeof obj == "object" && "mount" in obj && typeof obj["mount"] == "function";
}