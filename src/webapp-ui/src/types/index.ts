import type { ITemplateProvider } from "@eusoft/webapp-core/abstraction/ITemplateProvider";

export * from "./TimeSpan"

export type LocalString = string | { (): string }

export type ViewNode = LocalString | ITemplateProvider | JSX.Element | ViewNode[];

export type LoadResult = boolean;

export type EnumValue<T> = T[keyof T];

export type Enum = Record<string, string | number>;

export type FuckTS = any;