import { ViewNode } from "../Types";
import { IValidationContext, IValidationResult } from "../abstraction/Validator";


export const ValidationResult = {
    valid: {
        isValid: true
    } as IValidationResult,

    error: (msg: ViewNode) => ({
        isValid: false,
        error: msg
    } as IValidationResult)
}


export async function required(ctx: IValidationContext<any>, value: any)  {

    if (value === null || value === undefined || Array.isArray(value) && value.length == 0 || typeof(value) == "string" && value.trim().length == 0)
        return ValidationResult.error("msg-field-required");

    return ValidationResult.valid;
}