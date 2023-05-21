import { ViewNode } from "../Types";
import { IValidationContext } from "./Validator";

export interface IValidable {

    validateAsync<TTarget>(ctx?: IValidationContext<TTarget>, force?: boolean): Promise<boolean>;

    error: ViewNode;
     
    readonly isValid: boolean;
}

export function isValidable(obj: any) : obj is IValidable {
    return obj && typeof obj == "object" && "validateAsync" in obj && typeof obj["validateAsync"] == "function";
}