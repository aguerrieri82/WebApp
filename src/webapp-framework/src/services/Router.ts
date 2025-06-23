import { type IContent, type IContentConstructor, type IContentInfo, type IContentInstance, formatText, isResultContainer, isStateManager, replaceArgs, useOperation } from "@eusoft/webapp-ui";
import { app } from "../App";

type StringLike = { toString(): string } | string;

export type RouteArgs = ObjectLike;

export type RouteAction<TArgs extends RouteArgs> = (args: TArgs, content?: unknown) => void | Promise<unknown>;

interface IRounteEntry<TArgs extends RouteArgs>  {

    route: string|RegExp;

    action: RouteAction<TArgs>;

    tag?: unknown;

    backAction?: () => void;
}

interface IRouteState {

    url: string;

    entryIndex: number;

    args?: RouteArgs;

    historyIndex: number;

    state?: Record<string, unknown>;

    type?: "action" | undefined;
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

        window.addEventListener("popstate", ev => {
            console.debug("popstate");
            this.popStateAsync(JSON.parse(ev.state) as IRouteState);
        });

        window.addEventListener("beforeunload", () => this.saveState());

        window.addEventListener("pageshow", ev => {
            console.log(ev);
        });
    } 

    protected matchRoute(route: string, path: string) {

        const paramNames = [];
        const regex = new RegExp('^' + route.replace(/{([^}]+)}/g, (_, key) => {
            paramNames.push(key);
            return '([^/]+)';
        }) + '$');

        const match = path.match(regex);

        if (match) {

            const params = {};

            paramNames.forEach((name, i) => {
                params[name] = decodeURIComponent(match[i + 1]);
            });

            return params;
        }
    }

    getCurrentLocation() {
        return location.pathname;
    }

    startAsync() {

        const curState = JSON.parse(history.state) as IRouteState;

        if (this._activeIndex != -1 && curState)
            return this.popStateAsync(curState, "reload");

        if (this._activeIndex == -1)
            this._activeIndex++;

        return this.navigateActiveRouteAsync();
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

            if (boundArgs)
                Object.assign(args, boundArgs);

            const isBack = args && args["@isBack"] === true;

            if (!isBack && isStateManager(app.contentHost.content)) {

                const history = this._history[this._activeIndex - 1];
                history.state = {};
                app.contentHost.content.saveState(history.state);
            }

            if (isBack && isStateManager(page)) {
                const history = this._history[this._activeIndex];
                page.restoreState(history.state);
            }
                
            if (!await app.contentHost.loadContentAsync(page, args))
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

    navigatePageForResultAsync<TResult, TArgs extends RouteArgs>(pageOrName: string|IContent<TArgs>, args?: TArgs, replace = false) {

        return useOperation(() => new Promise<TResult>(res => {

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

            this.navigatePageAsync(page, args, replace);

        }), { unblock: true });
    }

    async navigatePageAsync<TArgs extends RouteArgs>(pageOrName: string | IContent<TArgs>, args?: TArgs, replace = false) {

        const entry = this.getEntryForPage(pageOrName);

        if (!entry?.route && typeof pageOrName != "string") {

            await app.contentHost.loadContentAsync(pageOrName, args);

            return pageOrName;
        } 

        return await this.navigateEntryAsync(entry, args, replace, typeof pageOrName == "string" ? undefined : pageOrName);
    }

    /*
    
    TODO: it works, not sure if keep or not

    pushAction(onBack: () => void) {

        const url = this._history[this._activeIndex].url;

        const newEntry = {

            backAction: () => {

                const index = this._entries.indexOf(newEntry);

                if (index != -1)
                    this._entries.splice(index, 1);

                onBack();
            }
        } as IRounteEntry<ObjectLike>;

        this._entries.push(newEntry);

        this._activeIndex++;
       
        const state = {
            historyIndex: this._activeIndex,
            entryIndex: this._entries.length - 1,
            type: "action"
        } as IRouteState;

        const jsonState = JSON.stringify(state);

        history.pushState(jsonState, undefined, url + "#action");

        this._history[this._activeIndex] = state;

        this._history.splice(this._activeIndex + 1, this._history.length - this._activeIndex);

        return newEntry;
    }

    cancelAction(action: IRounteEntry<ObjectLike>) {

        const index = this._entries.indexOf(action);

        if (index != -1 && this._history[this._activeIndex].entryIndex == index) {
            history.back();
        }
    }
    */

    protected getEntryForPage<TArgs extends ObjectLike>(pageOrName: string | IContent<TArgs>) {

        if (typeof pageOrName == "string")
            return this._entries.find(a => (a.tag as IContentInfo)?.name == pageOrName || a.route == pageOrName);

        return this._entries.find(a => (a.tag as IContentInfo)?.name == pageOrName.name);
    }

    protected async popStateAsync(state: IRouteState, transition = "pop") {

        if (!state)
            return;

        const isBack = state.historyIndex < this._activeIndex;

        const prevState = this._history[state.historyIndex + (isBack ? 1 : -1)];

        this._activeIndex = state.historyIndex;

        if (isBack && prevState?.type == "action") {

            const entryIndex = prevState.entryIndex;
            const entry = this._entries[entryIndex];
            entry?.backAction();
        }
        else if (!isBack && state.type == "action") {

            //ignore forward
        }
        else {

            const entry = this._entries[state.entryIndex];

            await this.navigateEntryAsync(entry, { ...state.args, "@isBack": true }, true, null, transition);
        }

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

        for (const entry of this._entries) {

            const matchArgs = this.matchRoute(entry.route as string, url);

            if (matchArgs) 
                return await this.navigateEntryAsync(entry, matchArgs, true, null, "reload");
        }

    }

    protected replaceUrl(path: string, args: RouteArgs) {

        return replaceArgs(path, args);
    }

    protected async navigateEntryAsync<TArgs extends ObjectLike>(entry: IRounteEntry<TArgs>, args?: TArgs, replace = false, content?: unknown, transition?: string) {

        const activeTrans = transition ?? ((entry.tag as IContentInfo)?.transition ?? "push");

        document.documentElement.dataset.transition = activeTrans;

        const newArgs = { ...args } as TArgs;

        const result = await entry.action(newArgs, content);

        if (!result)
            return;

        const url = this.replaceUrl(entry.route as string, newArgs);

        if (!replace)
            this._activeIndex++;

        const state = {
            url: url,
            args: newArgs,
            historyIndex: this._activeIndex,
            entryIndex: this._entries.indexOf(entry)
        } as IRouteState;

        const jsonState = JSON.stringify(state); 

        if (replace)
            history.replaceState(jsonState, "", url);
        else
            history.pushState(jsonState, "", url);

        this._history[this._activeIndex] = state;

        if (!replace)
            this._history.splice(this._activeIndex + 1, this._history.length - this._activeIndex);

        return true;
    }

    useTransition: boolean = true;

}

export const router = new Router();

export default router;

