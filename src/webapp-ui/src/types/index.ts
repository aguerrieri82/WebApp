import type { ITemplateProvider } from "@eusoft/webapp-core/abstraction/ITemplateProvider";

export * from "./TimeSpan"

export type LocalString = string | { (): string }

export type ViewNode = LocalString | ITemplateProvider | JSX.Element | ViewNode[];

export type LoadResult = boolean;