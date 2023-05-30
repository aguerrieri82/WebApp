import { IComponent } from "@eusoft/webapp-core";
import { IFeature } from "./IFeature";
import { NumberEditorTemplates } from "../editors";
import { ViewNode } from "../Types";

export type LoadState = "loaded" | "loading" | "error" | undefined;


export interface IPage<TArgs extends Record<string, any> = undefined> extends IComponent {

    loadAsync(args?: TArgs): Promise<boolean>;

    onOpen(): void;

    onClose(): void;

    route: string;

    features: IFeature<this>[];

    readonly loadState: LoadState;
}

export interface IPageInfo {

    name: string;

    route: string;

    icon?: ViewNode;

    factory: () => IPage;
}

export interface IPageConstructor {

    new(): IPage;

    readonly info: IPageInfo;
}