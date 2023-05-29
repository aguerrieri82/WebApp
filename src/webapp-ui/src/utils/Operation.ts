import { Services } from "@eusoft/webapp-core";
import { IOperationManager, IOperationOptions, OPERATION_MANAGER } from "../abstraction";


export async function useOperation<T>(action: () => Promise<T>, options?: IOperationOptions) {

    const operation = Services[OPERATION_MANAGER] as IOperationManager;

    const newOp = operation?.begin(options);

    try {

        return await action();
    }
    finally {
        newOp?.end();
    }
}