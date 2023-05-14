import { app } from "@eusoft/webapp-ui";
import { IPage } from "@eusoft/webapp-ui/src/abstraction/IPage";

type StringLike = { toString(): string } | string;

type RouteArgs = Record<string, StringLike>;

export type RouteAction<TArgs extends RouteArgs> = (args: TArgs) => void | Promise<any>;

interface IRounteEntry<TArgs extends RouteArgs>  {

    path: string|RegExp;

    action: RouteAction<TArgs>;

    tag?: any;
}

interface IRounteHistory<TArgs extends RouteArgs> {

    url: string;

    action: RouteAction<TArgs>;

    args?: TArgs;
}

interface IRouteState {

    url: string;

    entryIndex: number;

    args?: RouteArgs;

    historyIndex: number;
}

class Router {

    protected _history: IRounteHistory<any>[] = [];
    protected _entries: IRounteEntry<any>[] = [];
    protected _activeIndex: number = -1;

    constructor() {

        window.addEventListener("popstate", ev => {

            const state = ev.state as IRouteState;

            if (this._history[state.historyIndex]?.url == state.url) {
                this.goToAsync(state.historyIndex);
            }
            else {

                this._activeIndex = state.historyIndex;

                const entry = this._entries[state.entryIndex];

                this.navigateEntryAsync(entry, state.args, true);
            }

            
        });
    }

    startAsync() {

        this._activeIndex++;

        return this.navigateActiveRouteAsync();
    }

    protected async navigateActiveRouteAsync() {

        const url = window.location.pathname;

        const entry = this._entries.find(a => a.path == url);  //<-- TODO implement

        if (entry) {

            const args = this.parseArgs(entry.path as string, url);

            await this.navigateEntryAsync(entry, args, true);
        }
    }


    parseArgs<TArgs extends RouteArgs>(path: string, url: string): TArgs {

        //TODO implement
        return {} as TArgs;
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

        if (replace)
            history.replaceState(state, "", url);
        else 
            history.pushState(state, "", url);

        this._history[this._activeIndex] = {
            action: entry.action,
            url: url,
            args: args
        }

        this._history.splice(this._activeIndex + 1, this._history.length - this._activeIndex);

        await entry.action(args);
    }

    async goToAsync(index: number) {

        this._activeIndex = index;

        const entry = this._history[this._activeIndex];

        await entry.action(entry.args);
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

            await page.loadAsync(args as TArgs);

            app.pageHost.content = page;

        });

        result.tag = page;

        return result;

    }

    back() {
        history.back();
    }

    async navigateAsync<TArgs extends RouteArgs>(page: IPage<TArgs>, args?: TArgs) {

        let entry = this._entries.find(a => a.tag == page);
        if (!entry)
            entry = this.addPage(page);

        await this.navigateEntryAsync(entry, args);
    }
}

export const router = new Router();

