import { SERVICE_TYPE, mount } from "@eusoft/webapp-core";
import { IOperationManager, IOperation, OPERATION_MANAGER, IOperationOptions } from "../abstraction/IOperationManager";
import { Blocker } from "../components/Blocker";

export class OperationManager implements IOperationManager {

    protected _blockCount = 0;

    constructor() {

        this.blocker = new Blocker();

        mount(document.body, this.blocker);
    }

    begin(options?: IOperationOptions): IOperation {

        if (this._blockCount == 0)
            this.blocker.visible = true;

        this._blockCount++;

        const result: IOperation = {
            name: options?.name,
            end: () => this.end(result)
        };

        return result;
    }

    protected end(operation: IOperation) {

        this._blockCount--;

        if (this._blockCount == 0)
            this.blocker.visible = false;
    }

    blocker: Blocker;

    readonly [SERVICE_TYPE] = OPERATION_MANAGER;
}