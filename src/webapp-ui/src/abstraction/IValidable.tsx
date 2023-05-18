import { ViewNode } from "../Types";
import { IValidationContext, IValidationResult } from "./Validator";

export interface IValidable {

    validateAsync(force?: boolean): Promise<boolean>;

    error: ViewNode;
     
    readonly isValid: boolean;
}