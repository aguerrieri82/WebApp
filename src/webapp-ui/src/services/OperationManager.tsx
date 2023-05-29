import { SERVICE_TYPE, mount } from "@eusoft/webapp-core";
import { IOperationManager, IOperation, OPERATION_MANAGER, IOperationOptions } from "../abstraction/IOperationManager";
import { Blocker } from "../components/Blocker";
import { ProgressView } from "../components/ProgressView";
import { ViewNode } from "../Types";

export class OperationManager implements IOperationManager {

    protected _blockCount = 0;

    constructor() {

        this.blocker = new Blocker();
        this.blocker.content = new ProgressView({
            isIndeterminate: true
        });

        mount(document.body, this.blocker);
    }

    begin(options?: IOperationOptions): IOperation {

        if (!options?.isLocal) {

            if (this._blockCount == 0)
                this.blocker.visible = true;

            this._blockCount++;
        }

        const result: IOperation = {

            progress: (message: ViewNode, value?: number, min?: number, max?: number) => {

            },

            isLocal: options?.isLocal,

            name: options?.name,

            end: () => this.end(result)
        };

        return result;
    }

    protected end(operation: IOperation) {

        if (operation?.isLocal)
            return;

        this._blockCount--;

        if (this._blockCount == 0)
            this.blocker.visible = false;
    }

    blocker: Blocker<ProgressView>;

    readonly [SERVICE_TYPE] = OPERATION_MANAGER;
}