import { type IContent, type IContentConstructor, type IContentInfo, type IContentInstance, formatText, isResultContainer, replaceArgs } from "@eusoft/webapp-ui";
import { app } from "../App";

type StringLike = { toString(): string } | string;

export type RouteArgs = ObjectLike;

export type RouteAction<TArgs extends RouteArgs> = (args: TArgs, content?: unknown) => void | Promise<unknown>;

interface IRounteEntry<TArgs extends RouteArgs>  {

    route: string|RegExp;

    action: RouteAction<TArgs>;

    tag?: unknown;
}

interface IRouteState {

    url: string;

    entryIndex: number;

    args?: RouteArgs;

    historyIndex: number;
}

function restoreState<T>(key: string, defValue: T) {

    const value = sessionStorage.getItem(key);
    if (value)
        return JSON.parse(value) as T;

    return defValue;
}

export class Router {

    protected _history: IRouteState[];
    protected _entries: IRounteEntry<ObjectLike>[] = [];
    protected _activeIndex: number;
    protected _popResolve: () => void;

    constructor() {

        this._history = restoreState("router.history", []);

        this._activeIndex = restoreState("router.activeIndex", -1);

        window.addEventListener("popstate", ev => this.popStateAsync(JSON.parse(ev.state) as IRouteState));

        window.addEventListener("beforeunload", () => this.saveState());

        window.addEventListener("pageshow", ev => {
            console.log(ev);
        });
    } 

    getCurrentLocation() {
        return location.pathname;
    }

    startAsync() {

        const curState = JSON.parse(history.state) as IRouteState;

        if (this._activeIndex != -1 && curState)
            return this.popStateAsync(curState, "reload");

        this._activeIndex++;

        return this.navigateActiveRouteAsync();
    }

    parseArgs<TArgs extends RouteArgs>(path: string, url: string): TArgs {

        //TODO implement
        return {} as TArgs;
    }

    addAction<TArgs extends RouteArgs>(route: string, action: RouteAction<TArgs>) {

        const entry = {
            route,
            action,
        } as IRounteEntry<TArgs>;

        this._entries.push(entry);
        return entry;
    }

    addPage(infoOrPage: IContentInfo | IContentConstructor | IContentInstance) {

        const info = typeof infoOrPage == "function" ? infoOrPage.info : infoOrPage;

        const boundArgs = "args" in info ? info.args : {};

        const result = this.addAction(info.route, async (args, content: IContent) => {

            const page = content ?? info.factory();

            const fullArgs = {
                ...boundArgs,
                ...args
            };

            if (!await app.contentHost.loadContentAsync(page, fullArgs))
                return false;

            document.title = formatText(page.title) as string;

            return page;
        });

        result.tag = info;

        return result;

    }

    get canGoBack() {
        return this._activeIndex > 0;
    }

    backAsync() { 
        return new Promise<void>(res => {
            this._popResolve = res;
            history.back();
        });
    }

    async navigatePageForResultAsync<TResult, TArgs extends RouteArgs>(pageOrName: string|IContent<TArgs>, args?: TArgs) {

        return new Promise<TResult>(res => {

            const entry = this.getEntryForPage(pageOrName);

            const page = (entry?.tag as IContentInfo).factory();

            const onClose = page.onCloseAsync;

            page.onCloseAsync = async () => {

                try {
                    onClose.call(page); 
                    res(isResultContainer(page) ? page.result as TResult : undefined);
                }
                finally {
                    page.onCloseAsync = onClose;
                }
            }

            this.navigatePageAsync(page, args);
        });
    }

    async navigatePageAsync<TArgs extends RouteArgs>(pageOrName: string | IContent<TArgs>, args?: TArgs) {

        const entry = this.getEntryForPage(pageOrName);

        if (!entry?.route && typeof pageOrName != "string") {

            await app.contentHost.loadContentAsync(pageOrName, args);

            return pageOrName;
        } 

        return await this.navigateEntryAsync(entry, args, false, typeof pageOrName == "string" ? undefined : pageOrName);
    }

    protected getEntryForPage<TArgs extends ObjectLike>(pageOrName: string | IContent<TArgs>) {

        if (typeof pageOrName == "string")
            return this._entries.find(a => (a.tag as IContentInfo)?.name == pageOrName || a.route == pageOrName);

        return this._entries.find(a => (a.tag as IContentInfo)?.name == pageOrName.name);
    }

    protected async popStateAsync(state: IRouteState, transition = "pop") {

        if (!state)
            return;

        this._activeIndex = state.historyIndex;

        const entry = this._entries[state.entryIndex];

        await this.navigateEntryAsync(entry, state.args, true, null, transition);

        if (this._popResolve) {
            this._popResolve();
            this._popResolve = null;
        }
    }

    protected saveState() {
        sessionStorage.setItem("router.history", JSON.stringify(this._history));
        sessionStorage.setItem("router.activeIndex", JSON.stringify(this._activeIndex));
    }

    protected async navigateActiveRouteAsync() {

        const url = this.getCurrentLocation();

        const entry = this._entries.find(a => a.route == url);  //<-- TODO implement

        if (entry) {

            const args = this.parseArgs(entry.route as string, url);

            return await this.navigateEntryAsync(entry, args, true, null, "reload");
        }
    }

    protected replaceUrl(path: string, args: RouteArgs) {

        return replaceArgs(path, args);
    }

    protected async navigateEntryAsync<TArgs extends ObjectLike>(entry: IRounteEntry<TArgs>, args?: TArgs, replace = false, content?: unknown, transition?: string) {

        const activeTrans = transition ?? ((entry.tag as IContentInfo)?.transition ?? "push");

        document.documentElement.dataset.transition = activeTrans;

        const url = this.replaceUrl(entry.route as string, args);

        if (!replace)
            this._activeIndex++;

        const state = {
            url: url,
            args: args,
            historyIndex: this._activeIndex,
            entryIndex: this._entries.indexOf(entry)
        } as IRouteState;

        const jsonState = JSON.stringify(state);

        const result = await entry.action(args, content);

        if (result !== false)
        {
            if (replace)
                history.replaceState(jsonState, "", url);
            else
                history.pushState(jsonState, "", url);

            this._history[this._activeIndex] = state;

            if (!replace)
                this._history.splice(this._activeIndex + 1, this._history.length - this._activeIndex);
        }

       // delete document.documentElement.dataset.transition;

        return result;
    }

    useTransition: boolean = true;

}

export const router = new Router();

export default router;

