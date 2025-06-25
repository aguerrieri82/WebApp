import { type ViewNode } from "../types";

export interface IValidationContext<TTarget = Record<string, unknown>> {

    target?: TTarget;

    fieldName?: string;
}

export interface IValidationResult {
    isValid: boolean;
    error?: ViewNode;
}

export type Validator<TValue, TTarget = Record<string, unknown>> = (ctx: IValidationContext<TTarget>, value: TValue) => Promise<IValidationResult>;