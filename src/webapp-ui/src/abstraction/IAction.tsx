import { type LocalString, type ViewNode } from "../types";

export type ActionPriority = "primary" | "secondary";

export type ActionType = "local" | "global" | undefined;

export interface IActionContext<TTarget = unknown> {
    target?: TTarget;
}

export interface IAction<
    TTarget = unknown,
    TCtx extends IActionContext<TTarget> = IActionContext<TTarget>> {

    name: string;

    text?: LocalString;

    icon?: ViewNode;

    type?: ActionType;

    priority?: ActionPriority;

    subActions?: IAction<TTarget>[];

    //canExecuteAsync?: (ctx: IActionContext<TTarget>) => Promise<boolean>;

    executeAsync: (ctx: TCtx) => Promise<unknown>;
}