import { type IService } from "@eusoft/webapp-core";
import { type ViewNode } from "../Types";

export const OPERATION_MANAGER : symbol = Symbol.for("$operationManager");

export interface IOperationOptions {
    name?: string;
    isLocal?: boolean;
    unblock?: boolean;
}

export interface IOperation {

    name?: string;

    isLocal: boolean;

    unblock: boolean;

    progress(message: ViewNode, value?: number, min?: number, max?: number);

    end(): void;
}

export interface IOperationManager extends IService<typeof OPERATION_MANAGER> {

    begin(options?: IOperationOptions): IOperation;
}