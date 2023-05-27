import { Services, mount } from "@eusoft/webapp-core";
import { LOCALIZATION, OPERATION_MANAGER, OperationManager, PageHost } from "@eusoft/webapp-ui";
import localTable from "./services/LocalTable";

export interface IAppOptions {

}

export interface IApp {

    runAsync(root?: HTMLElement | string);

    pageHost: PageHost;
}

export class App  {

    constructor(options?: IAppOptions) {


    }

    async runAsync(root?: HTMLElement | string) {


        Services[OPERATION_MANAGER] = new OperationManager();
        Services[LOCALIZATION] = localTable;

        await this.onStarted();

        if (typeof root == "string")
            root = document.querySelector(root) as HTMLElement;

        else if (!root)
            root = document.body;


        mount(root, this.pageHost);
    }

    protected onStarted() {

    }

    readonly pageHost = new PageHost();
}

export function runApp<TApp extends IApp>(newApp: TApp) {

    app = newApp;

    window.addEventListener("load", () => {
        newApp.runAsync();
    });

    return newApp;
}

export var app: IApp;
