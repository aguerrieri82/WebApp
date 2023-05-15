import { IComponent } from "@eusoft/webapp-core";

export type LoadState = "loaded" | "loading" | "";

export interface IPage<TArgs extends Record<string, any> = undefined> extends IComponent {

    loadAsync(args?: TArgs): Promise<any>;

    onOpen(): void;

    onClose(): void;

    route: string;

    name: string;

    readonly loadState: LoadState;
}