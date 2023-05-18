import { ViewNode } from "../Types";

export interface IValidationContext<TTarget> {

    target?: TTarget;
}

export interface IValidationResult {
    isValid: boolean;
    error?: ViewNode;
}

export type Validator<TValue, TTarget = any> = (ctx: IValidationContext<TTarget>, value: TValue) => Promise<IValidationResult>;