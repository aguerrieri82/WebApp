
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export class HttpError extends Error {
    constructor(response: Response) {
        super();
        this.response = response;
    }

    readonly response: Response;
}

export class BaseApiClient {

    constructor(endpoint?: string) {
        this.endpoint = endpoint;
    }

    protected buildUrl(path: string, query?: object) {

        let url = this.endpoint + path;

        if (query) {

            let queryString = "";

            const appendValue = (key: string, value: any) => {

                if (queryString.length > 0)
                    queryString += "&";

                if (value instanceof Date)
                    value = value.toJSON();

                queryString += `${key}=${encodeURIComponent(value)}`;
            }

            for (const key in query) {

                const value = query[key];

                if (value === null || value === undefined)
                    continue;

                if (Array.isArray(value)) {
                    for (const item of value)
                        appendValue(key, item);
                }
                else
                    appendValue(key, value);
            }
            url += "?" + queryString;
        }

        return url;
    }

    protected async requestAsync(path: string, method: HttpMethod = "GET", data?: object, query?: object) {

        const url = this.buildUrl(path, query);

        let body: any = null;

        const headers: Record<string, string> = {};

        if (data && method != "GET") {
            body = JSON.stringify(data);
            headers["Content-Type"] = "application/json";
        }

        if (this.authorization) 
            headers["Authorization"] = this.authorization;
        

        const response = await fetch(url, {
            body,
            method,
            headers
        });

        if (!response.ok)
            throw new HttpError(response);

        return response;
    }

    protected async requestTextAsync(path: string, method: HttpMethod = "GET", data?: object, query?: object): Promise<TResult> {

        const response = await this.requestAsync(path, method, data, query);

        const text = await response.text();

        return text;
    }

    protected async requestJsonAsync<TResult>(path: string, method: HttpMethod = "GET", data?: object, query?: object): Promise<TResult> {

        return JSON.parse(await this.requestTextAsync(path, method, data, query);
    }

    protected get authorization() {
        return undefined;
    }

    endpoint: string;
}

export default BaseApiClient;