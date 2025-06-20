


export function fullUri(uri: string): string {

    if (!uri.startsWith("http://") && !uri.startsWith("https://")) {
        if (uri.startsWith("/"))
            uri = uri.substring(1);
        return window.location.origin + "/" + uri;
    }

    return uri;
}