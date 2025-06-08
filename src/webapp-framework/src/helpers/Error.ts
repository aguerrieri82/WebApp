import type { LocalString } from "@eusoft/webapp-ui/Types";
import { userInteraction } from "../services";
import { formatText } from "@eusoft/webapp-ui/utils/Format";

interface IHandleErrorOptions {
    defaultMessage?: LocalString;
    displayTime?: number;
}

export async function handleError<T>(action: () => Promise<T>, options?: IHandleErrorOptions): Promise<T> {

    try {

        return await action();

    }
    catch (ex) {

        console.warn(handleError, ex);

        userInteraction.messageAsync(
            formatText(ex?.message ?? options?.defaultMessage),
            "error",
            options?.displayTime ?? 4000);  
    }

}