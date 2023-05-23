import { SERVICE_TYPE } from "@eusoft/webapp-core";
import { IOperationManager, IOperation, OPERATION_MANAGER } from "../abstraction/IOperationManager";

export class OperationManager implements IOperationManager {

    begin(): IOperation {
        throw new Error("Method not implemented.");
    }

    readonly [SERVICE_TYPE] = OPERATION_MANAGER;
}