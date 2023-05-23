import { IService } from "@eusoft/webapp-core";

export const OPERATION_MANAGER: unique symbol = Symbol.for("$operationManager");

export interface IOperation {

    end(): void;
}

export interface IOperationManager extends IService<typeof OPERATION_MANAGER> {

    begin(): IOperation;
}