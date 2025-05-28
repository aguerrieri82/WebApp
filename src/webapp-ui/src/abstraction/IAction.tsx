import { type LocalString, type ViewNode } from "../Types";


export type ActionPriority = "primary" | "secondary";

export type ActionType = "local" | "global" | undefined;

export interface IActionContext<TTarget = unknown> {
    target?: TTarget;
}

export interface IAction<TTarget = unknown> {

    name: string;

    text?: LocalString;

    icon?: ViewNode;

    type?: ActionType;

    priority?: ActionPriority;

    subActions?: IAction<TTarget>[];

    executeAsync: (ctx: IActionContext<TTarget>) => Promise<any>;
}