import { MaterialIcon, type LocalString, formatText,  dateAdd, dayEnd, dayStart, now, TimeSpan } from "@eusoft/webapp-ui";
import type { ISearchItem, ISearchItemProvider, ISearchQuery } from "../abstraction/ISearchItemProvider";
import { localTable } from "../services";

export interface IDateRange {
    from?: Date;
    to?: Date;
}

/**********************************/
/*  dateRangeSearch */
/**********************************/

interface IDatePart {
    keyword: string;
    value: number;
    rank?: number;
}


export function indexOfStartsWith(list: string[], value: string)  {

    return indexOf(list, value, (a, b) => a.toLowerCase().startsWith(b.toLowerCase()));
}

export function indexOf(
    list: string[],
    value: string,
    compareFunc: (a: string, b: string) => boolean
): [number, number]  {
    let foundIndex = -1;
    let curLeftChar = -1;

    for (let i = 0; i < list.length; i++) {
        if (compareFunc(list[i], value)) {
            const leftChar = list[i].length - value.length;
            if (foundIndex === -1 || leftChar < curLeftChar) {
                foundIndex = i;
                curLeftChar = leftChar;
            }
        }
    }

    const rank = foundIndex === -1 ? 0 : 1 - curLeftChar / list[foundIndex].length;

    return [foundIndex, rank];
}

interface IDateRangeSearchOptions<TFilter> {

    fromField: KeyOfType<TFilter, Date | string>;

    toField: KeyOfType<TFilter, Date | string>;

    label?: LocalString;

    includeHours?: boolean;

    color?: string;

    preferFuture?: boolean;

    rank?: number;
}

export function dateRangeSearch<TFilter>(options: IDateRangeSearchOptions<TFilter>) {


    const MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(a => new Date(2025, a, 1).toLocaleDateString(localTable.language, {
        month: "long"
    }));

    const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6].map(a => new Date(2025, 5, 16 + a).toLocaleDateString(localTable.language, {
        weekday: "long"
    }));

    const keywords = ["today", "yesterday", "month", "week", "year"];

    const icon = <MaterialIcon name="calendar_month" />

    const curLabel = formatText(options.label ?? "dates") as string;

    const formatDate = (date: Date) => {

        return date.toLocaleDateString(localTable.language, {
            //weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
        })

    }

    const createItem = (range: IDateRange, keyword?: string) => {

        let text = keyword;
        if (!text) {

            const viewRange = { ...range }

            if (!options?.includeHours) {
                viewRange.from = viewRange.from ? dayStart(viewRange.from) : undefined;
                viewRange.to = viewRange.to ? dayStart(viewRange.to) : undefined;
            }

            if (viewRange.from?.getTime() == viewRange.to?.getTime())
                text = formatDate(viewRange.from);
            else if (!viewRange.from && viewRange.to)
                text = formatText("date-to", formatDate(viewRange.to)) as string;
            else if (viewRange.from && !viewRange.to)
                text = formatText("date-from", formatDate(viewRange.from)) as string;
            else 
                text = formatText("date-range", formatDate(viewRange.from), formatDate(viewRange.to)) as string;
        }

        return {
            value: range,
            fields: [options.fromField, options.toField],
            rank: options.rank ?? 0,
            allowMultiple: false,
            apply: (filter, value) => {
                filter[options.fromField] = value.from as any;
                filter[options.toField] = value.to as any;
            },
            view: {
                displayValue: text,
                label: curLabel,
                icon,
                color: options.color
            }
        } satisfies ISearchItem<TFilter, IDateRange>;
    }

    const match = (keywords: string[]) => {
        let now = new Date();

        let dayPart: IDatePart;
        let monthPart: IDatePart;
        let yearPart: IDatePart;
        let weekDayPart: IDatePart;

        for (const keyword of keywords) {
            const intValue = parseInt(keyword);
            if (!isNaN(intValue)) {
                if (!dayPart && intValue >= 1 && intValue <= 31)
                    dayPart = { keyword, value: intValue };

                if (!yearPart && intValue >= 2015 && intValue <= now.getFullYear() + 1)
                    yearPart = { keyword, value: intValue };
            }

            if (keyword.length < 3)
                continue;

            const [monthIdx] = indexOfStartsWith(MONTHS, keyword);
            if (monthIdx !== -1 && !monthPart)
                monthPart = { keyword, value: monthIdx + 1 };

            const [weekIdx] = indexOf(WEEK_DAYS, keyword, (a, b) =>
                a.replace("ì", "i").toLowerCase().startsWith(b.replace("ì", "i").toLowerCase())
            );
            if (weekIdx !== -1 && !weekDayPart)
                weekDayPart = { keyword, value: weekIdx };
        }

        let year = 0, month = 0, day = 0;

        if (dayPart) {
            day = dayPart.value;
            if (!monthPart && !yearPart) {
                year = now.getFullYear();
                month = (day < now.getDate() && options.preferFuture) ? now.getMonth() + 2 : now.getMonth() + 1;
            } else if (monthPart && !yearPart) {
                month = monthPart.value;
                year = now.getFullYear();
                if (month < now.getMonth() + 1) year++;
            } else if (monthPart && yearPart) {
                year = yearPart.value;
                month = monthPart.value;
            }

            return {
                from: new Date(year, month - 1, day),
                to: new Date(year, month - 1, day)
            };
        }

        if (monthPart && !dayPart) {
            year = yearPart ? yearPart.value : now.getFullYear();
            if (!yearPart && monthPart.value < now.getMonth() + 1) year++;

            const from = new Date(year, monthPart.value - 1, 1);
            const to = new Date(year, monthPart.value, 0);
            return { from, to };
        }

        if (yearPart && !dayPart && !monthPart) { 
            const from = new Date(yearPart.value, 0, 1);
            const to = new Date(yearPart.value, 11, 31);
            return { from, to };
        }

        if (weekDayPart) {
            let cur = new Date(now);
            while (true) {
                const weekDay = (cur.getDay() + 6) % 7; // map Sunday=6, Monday=0
                if (weekDay === weekDayPart.value) break;
                cur.setDate(cur.getDate() + 1);
            }
            return { from: cur, to: cur };
        }

        return null;
    }

    const splitRangeParts = (parts: string[]) => {
        const result = {
            from: undefined as string[],
            to: undefined as string[],
            fromLabel: undefined as string,
            toLabel: undefined as string
        };

        const fromLabels = ["from-date", "from-date-art"].map(a=> formatText(a) as string);
        const toLabels = ["to-date", "to-date-art"].map(a => formatText(a) as string);

        let mode = 0;
        let partIx = -1;
        for (const part of parts) {

            partIx++;

            if (fromLabels.includes(part) && (partIx == 0 || mode != 0)) {
                mode = 1;
                result.from = [];
                result.fromLabel = part;
                continue;
            }
            if (toLabels.includes(part) && (partIx == 0 || mode != 0)) {

                mode = 2;
                result.to = [];
                result.toLabel = part;
                continue;
            }

            if (mode == 1)
                result.from.push(part);

            else if (mode == 2)
                result.to.push(part);     

        }

        return result;
    }

    return {

        async searchAsync(query, curFilter, curItems) {

            const res: ISearchItem<TFilter, IDateRange>[] = [];

            const rangeParts = splitRangeParts(query.parts);
            const noFromTo = !rangeParts.from && !rangeParts.to;

            if (noFromTo)
                rangeParts.from = query.parts;

            const fromRange = rangeParts.from?.length > 0 ? match(rangeParts.from) : undefined;
            const toRange = rangeParts.to?.length > 0 ? match(rangeParts.to) : undefined;

            let combinedRange : IDateRange;

            if (noFromTo)
                combinedRange = fromRange;

            else if (fromRange?.from && !toRange?.to)
                combinedRange = { from: fromRange.from }

            else if (!fromRange?.from && toRange?.to)
                combinedRange = { to: toRange.to }

            else if (fromRange?.from && toRange?.to) {
                combinedRange = { from: fromRange.from, to: toRange.to }
            }

            if (rangeParts.from && rangeParts.from.length == 0) {
                res.push({
                    rank: -1,
                    fields: [options.fromField],
                    allowMultiple: false,
                    apply: (filter, value) => {
                        filter[options.fromField] = value?.from as any;
                    },
                    view: {
                        displayValue: <>{rangeParts.fromLabel ?? "" + " "}<span className="select">{formatText("field-select")}</span></>,
                        label: curLabel,
                        icon,
                        color: options.color
                    }
                })
            }
            
            if (rangeParts.to && rangeParts.to.length == 0) {
                res.push({
                    fields: [options.toField],
                    allowMultiple: false,
                    rank: -1,
                    apply: (filter, value) => {
                        filter[options.toField] = value?.to as any;
                    },
                    view: {
                        displayValue: <>{rangeParts.toLabel + " "}<span className="select">{formatText("field-select")}</span></>,
                        label: curLabel,
                        icon,
                        color: options.color
                    }
                })
            }

            if (combinedRange)
            {
                res.push(createItem(combinedRange));
            }
            else {
                for (const keyword of keywords) {
                    const trans = formatText(keyword) as string;
                    if (!query.parts.some(a => trans.toLowerCase().startsWith(a)))
                        continue;
                    if (keyword == "today") {
                        res.push(createItem({
                            from: dayStart(now()),
                            to: dayEnd(now()),
                        }));
                    }
                    if (keyword == "yesterday") {
                        res.push(createItem({
                            from: dayStart(dateAdd(now(), TimeSpan.fromDays(-1))),
                            to: dayEnd(dateAdd(now(), TimeSpan.fromDays(-1))),
                        }));
                    }
                }
            }

            return res;
        }

    } as ISearchItemProvider<TFilter, IDateRange>;
}

/**********************************/
/*  numberSearch */
/**********************************/

export function numberSearch<TFilter>(field: KeyOfType<TFilter, number>) {
    return {


        searchAsync(query, curFilter, curItems) {

        }

    } as ISearchItemProvider<TFilter, number>;
}

/**********************************/
/*  Helepers */
/**********************************/

const QUERY_SPLIT = /([^\s"']+)|"([^"]*)"|'([^']*)'/g

export function parseSearchQuery(query: string) {

    return {
        parts: [...(query?.trim().toLowerCase() ?? "").matchAll(QUERY_SPLIT)]
            .map(m => m[1] || m[2] || m[3])
            .filter(a => a.trim().length > 0),
        full: query
    } as ISearchQuery;
}

