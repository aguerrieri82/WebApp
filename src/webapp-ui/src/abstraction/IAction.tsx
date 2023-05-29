import { LocalString, ViewNode } from "../Types";


export enum ActionPriority {
    Primary,
    Secondary
}

export type ActionType = "local" | "global"| undefined;

export interface IActionContext<TTarget = unknown> {
    target?: TTarget;
}

export interface IAction<TTarget = unknown> {

    name: string;

    text?: LocalString;

    icon?: ViewNode;

    priority?: ActionPriority;

    executeAsync: (ctx: IActionContext<TTarget>) => Promise<any>;
}