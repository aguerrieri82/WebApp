import { ITemplateProvider } from "@eusoft/webapp-core"


export type LocalString = string | { (): string }

export type ViewNode = LocalString | ITemplateProvider;

export type Constructor<T> = { new () : T }