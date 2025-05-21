
export type CommitMode = "auto" | "manual" | "manual-inplace" | "auto-inplace";


export interface ICommitable<TValue, TEditValue> {

    commitAsync(): Promise<boolean>;

    beginEdit(value?: TValue): void;

    editValue: TEditValue;

    isDirty: boolean;

    commitMode: CommitMode;
}

export function isCommitable(obj: any): obj is ICommitable<unknown, unknown> {
    return obj && typeof obj == "object" && "commitAsync" in obj && typeof obj["commitAsync"] == "function";
}