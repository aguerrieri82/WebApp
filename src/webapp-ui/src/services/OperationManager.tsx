import { SERVICE_TYPE, mount } from "@eusoft/webapp-core";
import { type IOperationManager, type IOperation, OPERATION_MANAGER, type IOperationOptions } from "../abstraction/IOperationManager";
import { Blocker } from "../components/Blocker";
import { ProgressView } from "../components/ProgressView";
import { type ViewNode } from "../Types";

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
            //TODO reset _blockCount to  0
            if (options?.unblock)
                this.blocker.visible = false;
        }

        console.group(options?.name);

        const result: IOperation = {

            progress: (message: ViewNode, value?: number, min?: number, max?: number) => {

            },

            unblock: options?.unblock,

            isLocal: options?.isLocal,

            name: options?.name,

            end: () => this.end(result)
        };

        return result;
    }

    protected end(operation: IOperation) {

        console.log("End ", operation.name);

        console.groupEnd();

        if (operation?.isLocal)
            return;

        this._blockCount--;

        if (this._blockCount == 0)
            this.blocker.visible = false;

        else if (operation.unblock)
            this.blocker.visible = true;

    }

    blocker: Blocker<ProgressView>;

    readonly [SERVICE_TYPE] = OPERATION_MANAGER;
}