import { type ViewNode } from "../Types";
import { type IValidationContext, type IValidationResult, type Validator } from "../abstraction/Validator";
import { formatText } from "../utils/Format";

export const ValidationResult = {
    valid: {
        isValid: true
    } as IValidationResult,

    error: (msg: ViewNode) => ({
        isValid: false,
        error: msg
    } as IValidationResult)
}

export async function validEmail(ctx: IValidationContext<unknown>, value: string) {

    const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    const isValid = !value || value.trim().length == 0 ? true : regExp.test(value);
    if (!isValid)
        return ValidationResult.error(formatText("err-invalid-email", ctx?.fieldName));

    return ValidationResult.valid;
}

export function validateWhen<TValiator extends Validator<unknown, unknown>>(selector: () => boolean, validator: TValiator) {
    return async (ctx: IValidationContext<unknown>, value: unknown) => {
        if (!selector())
            return ValidationResult.valid;
        return await validator(ctx, value);
    }
}

export async function required(ctx: IValidationContext<unknown>, value: unknown)  {

    if (value === null || value === undefined || Array.isArray(value) && value.length == 0 || typeof(value) == "string" && value.trim().length == 0)
        return ValidationResult.error(formatText("err-field-required", ctx?.fieldName));

    return ValidationResult.valid;
}

export async function integer(ctx: IValidationContext<unknown>, value: number) {

    if (value !== null && value !== undefined && (isNaN(value) || Math.round(value) != value))
        return ValidationResult.error(formatText("err-field-integer", ctx?.fieldName));

    return ValidationResult.valid;
}

export function range(min?: number, max?: number) {

    return async (ctx: IValidationContext<unknown>, value: number) => {

        if (value !== undefined && value !== null) {

            if (min !== undefined && min !== null && value < min)
                return ValidationResult.error(formatText("err-field-greater-equals", ctx?.fieldName, min));

            if (max !== undefined && max !== null && value > max)
                return ValidationResult.error(formatText("err-field-less-equals", ctx?.fieldName, max));
        }

        return ValidationResult.valid;
    }
}

export function maxLength(length: number) {

    return async (ctx: IValidationContext<unknown>, value: string) => {

        if (value && value.length > length)
            return ValidationResult.error(formatText("msg-field-required", ctx?.fieldName, length));

        return ValidationResult.valid;
    }
}