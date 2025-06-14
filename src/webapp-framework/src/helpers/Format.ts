import { formatDate } from "@eusoft/webapp-ui/utils/Date";
import { formatTextSimple } from "@eusoft/webapp-ui/utils/Format";

export function formatDateTime(date: string | Date): string {

    return formatDate(date, formatTextSimple("format-date-time") as string);
}