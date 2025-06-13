import type { LocalString } from "@eusoft/webapp-ui/Types";
import { HttpError, userInteraction } from "../services";
import { formatText } from "@eusoft/webapp-ui/utils/Format";

interface IHandleErrorOptions {
    defaultMessage?: LocalString;
    displayTime?: number;
}

interface IApiError {
    message?: string;
    code: string;
}

export async function handleError<T>(action: () => Promise<T>, options?: IHandleErrorOptions): Promise<T> {

    try {

        return await action();

    }
    catch (ex) {

        if (ex instanceof HttpError) {
            const json = await ex.response.text();
            console.warn(json);

            try {
                const apiErrors = JSON.parse(json) as IApiError;
                if (Array.isArray(apiErrors) && apiErrors.length > 0  && apiErrors[0]?.message)
                    ex = apiErrors[0];
            }
            catch {

            }
        }
        console.warn("handleError", ex);

        userInteraction.messageAsync(
            formatText(ex?.message ?? options?.defaultMessage),
            "error",
            options?.displayTime ?? 4000);  
    }

}