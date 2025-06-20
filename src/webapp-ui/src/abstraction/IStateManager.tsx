

export interface IStateContext {

}

export interface IStateManager {

    saveState(container: Record<string, unknown>, ctx?: IStateContext): void;

    restoreState(container: Record<string, unknown>, ctx?: IStateContext): void;
}

export function isStateManager(obj: unknown): obj is IStateManager {
    return obj && typeof obj == "object" && "saveState" in obj && typeof obj["saveState"] == "function";
}