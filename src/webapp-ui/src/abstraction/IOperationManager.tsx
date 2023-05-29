import { IService } from "@eusoft/webapp-core";
import { ViewNode } from "../Types";

export const OPERATION_MANAGER : any = Symbol.for("$operationManager");

export interface IOperationOptions {
    name?: string;
    isLocal?: boolean;
}


export interface IOperation {

    name?: string;

    isLocal: boolean;

    progress(message: ViewNode, value?: number, min?: number, max?: number);

    end(): void;
}

export interface IOperationManager extends IService<typeof OPERATION_MANAGER> {

    begin(options?: IOperationOptions): IOperation;
}