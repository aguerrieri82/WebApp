import { type ITemplateContext, Services } from "@eusoft/webapp-core";
import { type IOperationManager, OPERATION_MANAGER } from "@eusoft/webapp-ui";

export async function useNetwork<T>(action: () => Promise<T>, ctx?: ITemplateContext): Promise<T> {

    const operation = (ctx ? ctx.require(OPERATION_MANAGER) : Services[OPERATION_MANAGER]) as IOperationManager;

    const newOp = operation?.begin({
        name: "begin network"
    });

    try {

        return await action();

    }
    finally {

        newOp?.end();
    }

}