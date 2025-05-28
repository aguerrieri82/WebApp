import { Services, mount } from "@eusoft/webapp-core";
import { type ContentHost, LOCALIZATION, OPERATION_MANAGER, OperationManager } from "@eusoft/webapp-ui";
import localTable from "./services/LocalTable";
import { RouteContentHost } from "./components/RouteContentHost";

export interface IAppOptions {

}

export interface IApp {

    runAsync(root?: HTMLElement | string);

    contentHost: ContentHost;
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


        mount(root, this.contentHost);
    }

    protected onStarted() {

    }

    readonly contentHost = new RouteContentHost();
}

export function runApp<TApp extends IApp>(newApp: TApp) {

    app = newApp;

    window.addEventListener("load", () => {
        newApp.runAsync();
    });

    return newApp;
}

export var app: IApp;
