import { ViewNode } from "../Types";
import { IValidationContext } from "./Validator";

export interface IValidable {

    validateAsync<TTarget>(ctx?: IValidationContext<TTarget>, force?: boolean): Promise<boolean>;

    error: ViewNode;
     
    readonly isValid: boolean;
}