
export type CommitMode = "auto" | "manual" | "manual-inplace";


export interface ICommitable<TValue> {

    commitAsync(): Promise<boolean>;

    editValue: TValue;

    isDirty: boolean;

    commitMode: CommitMode;
}

export function isCommitable(obj: any): obj is ICommitable<unknown> {
    return obj && typeof obj == "object" && "commitAsync" in obj && typeof obj["commitAsync"] == "function";
}