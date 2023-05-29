import { ITemplateProvider } from "@eusoft/webapp-core"


export type LocalString = string | { (): string }

export type ViewNode = LocalString | ITemplateProvider | JSX.Element | ViewNode[];

export type Constructor<T> = { new(): T }
