import { Services, mount } from "@eusoft/webapp-core";
import { type ContentHost, LOCALIZATION, OPERATION_MANAGER, OperationManager } from "@eusoft/webapp-ui";
import localTable from "./services/LocalTable";
import { RouteContentHost } from "./components/RouteContentHost";
import "./Transition.scss"


export interface IAppOptions {

}

export interface IApp<TContentHost extends ContentHost = ContentHost> {

    runAsync(root?: HTMLElement | string);

    contentHost: TContentHost;
}

export class App<TContentHost extends ContentHost = RouteContentHost> implements IApp<TContentHost> {

    constructor(options?: IAppOptions) {

    }

    liveReload() {

        const ws = new WebSocket(`wss://${document.location.hostname}:${document.location.port}/live`);
        function reload(path: string) {

            if (path.endsWith(".css")) {

                const css = Array.from(document.head.querySelectorAll("link"))
                    .find(a => a.getAttribute("href").includes(path)) as HTMLLinkElement;

                if (css)
                    css.href = path + '?cacheBuster=' + Date.now();
            }

            else if (path.endsWith("app.js")) {

                location.reload();
            }
        }

        ws.onmessage = event => {

            if (typeof event.data == "string")
                reload(event.data);
        }

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

    protected createContentHost() : TContentHost {
        return new RouteContentHost() as unknown as TContentHost;
    }

    readonly contentHost = this.createContentHost();
}

export function runApp<TApp extends IApp>(newApp: TApp) {

    app = newApp;

    window.addEventListener("load", () => {
        newApp.runAsync();
    });

    return newApp;
}

export var app: IApp;
