
export interface IValidationContext<TTarget> {

    target?: TTarget;
}

export interface IValidationResult {

}

export type Validator<TValue, TTarget = any> = (ctx: IValidationContext<TTarget>, value: TValue) => Promise<IValidationResult>;