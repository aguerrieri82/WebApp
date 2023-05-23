import { PageHost } from "./components/PageHost";
import { mount } from "@eusoft/webapp-core";
import { OperationManager } from "./services";
export interface IAppOptions {

}
export interface IApp {

    runAsync(root?: HTMLElement | string);

    pageHost: PageHost;
}


export class App  {

    constructor(options?: IAppOptions) {


    }

    runAsync(root?: HTMLElement | string) {

        if (typeof root == "string")
            root = document.querySelector(root) as HTMLElement;

        else if (!root)
            root = document.body;

        this.pageHost.provides(new OperationManager());

        mount(root, this.pageHost);

        this.onStarted();
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
