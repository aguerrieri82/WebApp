
interface WindowEventMap {
    pagereveal: PageRevealEvent;
}

interface Window {
    readonly navigation: Navigation;
}



interface Navigation extends EventTarget {
    readonly currentEntry: NavigationHistoryEntry | null;
    readonly canGoBack: boolean;
    readonly canGoForward: boolean;
    readonly activation: NavigationActivation | null;

    entries(): NavigationHistoryEntry[];
    updateCurrentEntry(options: NavigationUpdateCurrentEntryOptions): void;

    back(): void;
    forward(): void;
    reload(): void;

    traverseTo(key: string, options?: NavigationOptions): void;

    addEventListener(type: "navigate", listener: (this: Navigation, ev: NavigateEvent) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: "navigatesuccess", listener: (this: Navigation, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: "navigateerror", listener: (this: Navigation, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
}

interface NavigationOptions {
    info?: unknown;
    state?: unknown;
}

interface NavigationUpdateCurrentEntryOptions {
    state?: unknown;
}

interface NavigateEvent extends Event {
    readonly destination: NavigationDestination;
    readonly canIntercept: boolean;
    readonly userInitiated: boolean;
    readonly hashChange: boolean;
    readonly formData?: FormData;

    intercept(options?: NavigationInterceptOptions): void;
}

interface NavigationInterceptOptions {
    handler: (controller: NavigationInterceptHandler) => void | Promise<void>;
    focusReset?: "after-transition" | "manual";
    scroll?: "after-transition" | "manual";
}

interface NavigationInterceptHandler {
    respondWith(response: Promise<Response> | Response): void;
}

interface NavigationDestination {
    readonly key: string;
    readonly id: string;
    readonly url: string;
    readonly index: number;
    readonly sameDocument: boolean;
    getState(): unknown;
}