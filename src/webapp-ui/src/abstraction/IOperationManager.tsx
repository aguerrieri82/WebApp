import { IService } from "@eusoft/webapp-core";

export const OPERATION_MANAGER : any = Symbol.for("$operationManager");

export interface IOperationOptions {
    name?: string;
}


export interface IOperation {

    name?: string;

    end(): void;
}

export interface IOperationManager extends IService<typeof OPERATION_MANAGER> {

    begin(options?: IOperationOptions): IOperation;
}