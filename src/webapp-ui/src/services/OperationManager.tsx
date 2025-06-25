import { SERVICE_TYPE, mount } from "@eusoft/webapp-core";
import { type IOperationManager, type IOperation, OPERATION_MANAGER, type IOperationOptions } from "../abstraction/IOperationManager";
import { Blocker } from "../components/Blocker";
import { ProgressView } from "../components/ProgressView";
import { type ViewNode } from "../types";

export class OperationManager implements IOperationManager {

    protected _stack: IOperation[] = [];
    protected _blockStack: boolean[] = [];

    constructor() {

        this.blocker = new Blocker();
        this.blocker.content = new ProgressView({
            isIndeterminate: true
        });

        mount(document.body, this.blocker);
    }

    begin(options?: IOperationOptions): IOperation {

        const isBlock = !options?.unblock && !options?.isLocal;

        console.group(options?.name);

        const result: IOperation = {

            progress: (message: ViewNode, value?: number, min?: number, max?: number) => {

            },

            unblock: options?.unblock,

            isLocal: options?.isLocal,

            name: options?.name,

            end: () => this.end(result)
        };

        this._stack.push(result);

        this._blockStack.push(isBlock);

        this.blocker.visible = isBlock;

        return result;
    }

    protected end(operation: IOperation) {

        console.log("End ", operation.name);

        console.groupEnd();

        this._stack.pop();

        this._blockStack.pop();

        const isBlock = this._blockStack.length > 0 && this._blockStack[this._blockStack.length - 1];

        this.blocker.visible = isBlock;
    }

    blocker: Blocker<ProgressView>;

    readonly [SERVICE_TYPE] = OPERATION_MANAGER;
}