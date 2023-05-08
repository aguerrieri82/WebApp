import { PageHost } from "./Components/PageHost";
import { mount } from "@eusoft/webapp-core";
export interface IAppOptions {

}

export class App {

    constructor(options?: IAppOptions) {

    }

    runAsync(root?: HTMLElement | string) {

        if (typeof root == "string")
            root = document.querySelector(root) as HTMLElement;

        else if (!root)
            root = document.body;

        mount(root, this.pageHost);
    }

    readonly pageHost = new PageHost();
}


export var app: App;

export function runApp<TApp extends App>(newApp: TApp) {

    app = newApp;

    window.addEventListener("load", () => {
        newApp.runAsync();
    });

    return newApp;
}