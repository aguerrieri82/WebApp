import { MaterialIcon, type LocalString, formatText, dateAdd, dayEnd, dayStart, now, TimeSpan, formatString, type ViewNode } from "@eusoft/webapp-ui";
import type { ISearchItem, ISearchItemProvider, ISearchItemView, ISearchQuery, ITextValue } from "../abstraction/ISearchItemProvider";
import { localTable } from "../services";
import { popupEditAsync } from "./Editor";
import { CalendarEditor } from "../components/CalendarEditor";

export function matchText(query: ISearchQuery, matchList: (string | RegExp)[]): [boolean, ISearchQuery] {

    const noLabelQuery = {
        parts: [],
        full: ""
    } as ISearchQuery;

    if (query.parts.length == 0)
        return [false, noLabelQuery]

    for (const match of matchList) {

        if (typeof match == "string") {

            const matchParts = parseSearchQuery(match).parts;

            let isMatch = false;

            for (const queryPart of query.parts) {

                if (matchParts.some(a => a.startsWith(queryPart))) {

                    if (noLabelQuery.parts.length == 0)
                        isMatch = true;
                }
                else
                    noLabelQuery.parts.push(queryPart);
            }

            noLabelQuery.full = noLabelQuery.parts.join(" ");

            return [isMatch, noLabelQuery]
        }
        else {

            if (query.full.match(match))
                return [true, noLabelQuery]
        }
    }

    return [false, noLabelQuery]
}


export function indexOfStartsWith(list: string[], value: string) {

    return indexOf(list, value, (a, b) => a.toLowerCase().startsWith(b.toLowerCase()));
}

export function indexOf(
    list: string[],
    value: string,
    compareFunc: (a: string, b: string) => boolean
): [number, number] {
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


/**********************************/
/*  dateRangeSearch */
/**********************************/
export interface IDateRange {
    from?: Date;
    to?: Date;
}

interface IDatePart {
    keyword: string;
    value: number;
    rank?: number;
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


    const pickDateAsync = async (value: Date, editFrom: boolean, editTo: boolean) => {

        const res = await popupEditAsync(new CalendarEditor({
            initialValue: value
        }), value, {
            title: "select-date",
            okLabel: "select"
        });

        if (!res)
            return;

        return {
            value: {
                from: editFrom ? res : undefined,
                to: editTo ? res : undefined
            }
        } as ITextValue<IDateRange>
    }

    const applyFilter = (filter: TFilter, value: IDateRange) => {

        if (value.from)
            filter[options.fromField] = value.from as any;

        if (value.to)
            filter[options.toField] = value.to as any;
    }

    const createView = (range: IDateRange, text?: string) => {

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
            displayValue: text,
            label: curLabel,
            icon,
            color: options.color
        }
    }


    const createItem = (range: IDateRange, text?: string) => {

        return {
            value: range,
            fields: [options.fromField, options.toField],
            rank: options.rank ?? 0,
            allowMultiple: false,
            apply: applyFilter,
            createView: v => createView(v, text)

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

        const fromLabels = ["from-date", "from-date-art"].map(a => formatText(a) as string);
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

            let combinedRange: IDateRange;

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
                    editAsync: v => pickDateAsync(v?.from, true, rangeParts.fromLabel == null),
                    apply: applyFilter,
                    createView: v => {

                        if (!v?.from)
                            return {
                                displayValue: <>
                                    {rangeParts.fromLabel ?? "" + " "}
                                    <span className="select">{formatText("field-select")}</span>
                                </>,
                                label: curLabel,
                                icon,
                                color: options.color
                            }
                        return createView(v);
                    }
                })
            }

            if (rangeParts.to && rangeParts.to.length == 0) {
                res.push({
                    fields: [options.toField],
                    allowMultiple: false,
                    rank: -1,
                    apply: applyFilter,
                    editAsync: v => pickDateAsync(v?.to, false, true),
                    createView: v => {
                        if (!v?.to)
                            return {
                                displayValue: <>{
                                    rangeParts.toLabel + " "}
                                    <span className="select">{formatText("field-select")}</span>
                                </>,
                                label: curLabel,
                                icon,
                                color: options.color
                            }
                        return createView(v);
                    }
                })
            }

            if (combinedRange) {
                res.push(createItem(combinedRange));
            }
            else {
                for (const keyword of keywords) {
                    const trans = formatText(keyword) as string;
                    if (!query.parts.some(a => trans.toLowerCase().startsWith(a)))
                        continue;

                    let range: IDateRange;

                    if (keyword == "today") {
                        range = {
                            from: dayStart(now()),
                            to: dayEnd(now()),
                        };
                    }
                    if (keyword == "yesterday") {
                        range = {
                            from: dayStart(dateAdd(now(), TimeSpan.fromDays(-1))),
                            to: dayEnd(dateAdd(now(), TimeSpan.fromDays(-1))),
                        };
                    }

                    if (range)
                        res.push(createItem(range));
                }
            }

            return res;
        }

    } as ISearchItemProvider<TFilter, IDateRange>;
}

/**********************************/
/*  numberSearch */
/**********************************/

interface INumberRange {

    min?: number;

    max?: number;

    name?: LocalString;
}

interface INumberRangeSearchOptions<TFilter> {

    minField: KeyOfType<TFilter, number>;

    maxField: KeyOfType<TFilter, number>;

    label?: LocalString;

    color?: string;

    rank?: number;

    staticItems?: INumberRange[];

    keywords?: (string | RegExp)[];

    icon?: ViewNode;

    format?: (value: number) => string;
}

export function numberRangeSearch<TFilter>(options: INumberRangeSearchOptions<TFilter>) {

    const curLabel = formatString(options.label);

    const format = options.format ?? ((v: number) => v.toString());

    const createItem = (value?: INumberRange) => {
        const result = {
            value,

            allowMultiple: false,

            fields: [options.minField, options.maxField],

            apply: (filter, value) => {
                filter[options.minField as any] = value.min;
                filter[options.maxField as any] = value.max;
            },

            rank: 1,

            canSelect: !!value,

            createView: (value, text) => {
                let displayValue: ViewNode;

                if (text)
                    displayValue = text;
                if (!value)
                    displayValue = <i className="info">{formatText("digit-a-number")}</i>
                else if (value.name)
                    displayValue = formatText(value.name);
                else if (value.max !== undefined && value.min === undefined)
                    displayValue = formatText("search-num-max", format(value.max));
                else if (value.max === undefined && value.min !== undefined)
                    displayValue = formatText("search-num-min", format(value.min));
                else if (value.max !== undefined && value.min !== undefined)
                    displayValue = formatText("search-num-range", format(value.min), format(value.max));

                return {
                    displayValue,
                    label: curLabel,
                    icon: options.icon,
                    color: options.color
                }
            }
        } as ISearchItem<TFilter, INumberRange>;

        result.view = result.createView(value);

        return result;
    }

    return {

        async searchAsync(query, curFilter, curItems) {

            const res = [] as ISearchItem<TFilter, INumberRange>[];


            const [macthLabel, noLabelQuery] = matchText(query, [curLabel]);

            const nums: number[] = [];

            for (const part of noLabelQuery.parts) {
                const num = parseInt(part);
                if (!isNaN(num))
                    nums.push(num);
            }

            if (nums.length == 1) {
                res.push({
                    ...createItem({
                        min: nums[0]
                    }),
                });
                res.push({
                    ...createItem({
                        max: nums[0]
                    }),
                });
            }
            else if (nums.length == 2) {
                res.push({
                    ...createItem({
                        min: nums[0],
                        max: nums[1],
                    }),
                });
            }


            if (options.staticItems) {
                for (const item of options.staticItems) {

                    const [match] = matchText(query, [formatString(item.name)]);

                    if (noLabelQuery.parts.length == 0 || match) {
                        res.push({
                            ...createItem(item),
                        });
                    }
                }
            }

            if (nums.length == 0) {
                res.push({
                    ...createItem(),
                    rank: -1
                });
            }

            return res;
        }

    } as ISearchItemProvider<TFilter, INumberRange>;
}

/**********************************/
/*  QuerySearch */
/**********************************/

export interface IMatchField<TItem, TValue> {


    get(item: TItem): TValue;

    format(value: TValue): ISearchItemView
}


export interface IQuerySearchOptions<TFilter, TItem, TId> {

    queryField: KeyOfType<TFilter, string>;

    idsFilterField?: KeyOfType<TFilter, TId>;

    idItemField?: KeyOfType<TItem, TId>;

    match?: IMatchField<TItem, unknown>[];

    executeAsync: (query: string) => Promise<TItem[]>;

    minLength?: number;
}

export interface IQuerySearchProvider<TFilter, TItem> extends ISearchItemProvider<TFilter, string> {

}

export function querySearch<TFilter, TItem, TId>(options: IQuerySearchOptions<TFilter, TItem, TId>) {

    let items: TItem[] = [];

    const idItemField = (options.idItemField ?? "id") as KeyOfType<TItem, TId>;
    const idsFilterField = (options.idsFilterField ?? "ids") as KeyOfType<TFilter, TId[]>;

    const createItem = (id: TId[], text: string, match: IMatchField<TItem, unknown>) => {
        const result = {

            value: id,

            allowMultiple: false,

            fields: [idsFilterField],

            apply: (filter, value) => {
                let values = filter[idsFilterField] as TId[];
                values ??= [];
                values.push(...value);
                filter[idsFilterField as any] = values;
            },
            rank: 0,

            view: match.format(text),

        } as ISearchItem<TFilter, TId[]>;

        return result;
    }

    return {

        async searchAsync(query, curFilter, curItems) {

            const res = [] as ISearchItem<TFilter, TId[] | string>[];

            if (!options.minLength || query.full.length >= options.minLength) {

                res.push({
                    apply: (filter, value) => {
                        filter[options.queryField as any] = value;
                    },
                    allowMultiple: false,
                    value: query.full,
                    fields: [options.queryField],
                    rank: -1,
                    view: {
                        icon: <MaterialIcon name="search" />,
                        label: formatText("search"),
                        displayValue: <span>"{query.full}"</span>
                    }
                } as ISearchItem<TFilter, string>)

                if (options.match) {

                    items = await options.executeAsync(query.full);

                    for (const match of options.match) {

                        const map = new Map<string, TId[]>;

                        for (const item of items) {

                            const fieldValue = match.get(item)?.toString();

                            if (!fieldValue)
                                continue;

                            if (query.parts.every(a => fieldValue.toLowerCase().includes(a))) {

                                const id = item[idItemField] as TId;

                                if (!map.has(fieldValue))
                                    map.set(fieldValue, [id]);
                                else {
                                    map.get(fieldValue).push(id);
                                }
                            }
                        }

                        for (const key of map.keys()) {

                            res.push({
                                ...createItem(map.get(key), key, match),
                            })
                        }
                    }

                }
            }

            return res;
        }

    } as IQuerySearchProvider<TFilter, TItem>;
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

