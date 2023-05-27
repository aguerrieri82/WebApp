import { IPage } from "@eusoft/webapp-ui";
import { app } from "../App";

type StringLike = { toString(): string } | string;

export type RouteArgs = Record<string, StringLike>;

export type RouteAction<TArgs extends RouteArgs> = (args: TArgs) => void | Promise<any>;

interface IRounteEntry<TArgs extends RouteArgs>  {

    path: string|RegExp;

    action: RouteAction<TArgs>;

    tag?: any;
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
    protected _entries: IRounteEntry<any>[] = [];
    protected _activeIndex: number;
    protected _popResolve: () => void;

    constructor() {

        this._history = restoreState("router.history", []);
        this._activeIndex = restoreState("router.activeIndex", -1);

        window.addEventListener("popstate", ev => this.popStateAsync(JSON.parse(ev.state) as IRouteState));
        window.addEventListener("beforeunload", () => this.saveState());
    } 

    startAsync() {

        const curState = JSON.parse(history.state) as IRouteState;

        if (this._activeIndex != -1 && curState)
            return this.popStateAsync(curState);

        this._activeIndex++;

        return this.navigateActiveRouteAsync();
    }

    parseArgs<TArgs extends RouteArgs>(path: string, url: string): TArgs {

        //TODO implement
        return {} as TArgs;
    }

    addAction<TArgs extends RouteArgs>(path: string, action: RouteAction<TArgs>) {

        const entry = {
            path,
            action,
        } as IRounteEntry<TArgs>;

        this._entries.push(entry);
        return entry;
    }

    addPage<TArgs extends RouteArgs>(page: IPage<TArgs>) {

        const result = this.addAction(page.route, async args => {

            await app.pageHost.loadPageAsync(page, args);
        });

        result.tag = page;

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

    async navigatePageAsync<TArgs extends RouteArgs>(page: IPage<TArgs>, args?: TArgs) {

        let entry = this._entries.find(a => a.tag == page);
        if (!entry)
            entry = this.addPage(page);

        await this.navigateEntryAsync(entry, args);
    }

    protected async popStateAsync(state: IRouteState) {

        this._activeIndex = state.historyIndex;

        const entry = this._entries[state.entryIndex];

        await this.navigateEntryAsync(entry, state.args, true);

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

        const url = window.location.pathname;

        const entry = this._entries.find(a => a.path == url);  //<-- TODO implement

        if (entry) {

            const args = this.parseArgs(entry.path as string, url);

            await this.navigateEntryAsync(entry, args, true);
        }
    }

    protected replaceUrl(path: string, args: RouteArgs) {

        //TODO implement
        return path;
    }

    protected async navigateEntryAsync<TArgs extends Record<string, StringLike>>(entry: IRounteEntry<TArgs>, args?: TArgs, replace = false) {

        const url = this.replaceUrl(entry.path as string, args);

        if (!replace)
            this._activeIndex++;

        const state = {
            url: url,
            args: args,
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

        await entry.action(args);
    }

}

export const router = new Router();

export default router;

