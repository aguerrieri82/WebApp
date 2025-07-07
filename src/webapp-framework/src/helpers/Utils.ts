export function fullUri(uri: string): string {

    if (!uri.startsWith("http://") && !uri.startsWith("https://")) {
        if (uri.startsWith("/"))
            uri = uri.substring(1);
        return window.location.origin + "/" + uri;
    }

    return uri;
}

export function distinct<T>(items: Iterable<T>) {

    const map = new Map<T, true>();

    for (const item of items) 
        map.set(item, true);

    return Array.from(map.keys());
}

export function createInstance<TContent, TOptions>(factory: (options?: TOptions) => TContent, singleInstance: boolean) {

    let instance: TContent;

    return (opt: TOptions) => {

        if (singleInstance) {
            if (!instance)
                instance = factory(opt);
            return instance;
        }
        return factory(opt);
    }
}
