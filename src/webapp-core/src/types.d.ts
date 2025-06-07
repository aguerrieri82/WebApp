
type IfEquals<X, Y, A = X, B = never> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeys<T, TProp> = {
    [P in keyof T]-?: T[P] extends TProp ? IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P> : never
}[keyof T];

type EmptyConstructor<T> = { new(): T }

type OptionsFor<T> = {
    [K in keyof T as K extends string ? K extends "options" ? never : (T[K] extends Function ? never : K) : never] : T[K]
}

type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;


type StringLike = string | number | object | boolean | { toString(): string }


type Class<T> = new (...args: any) => T;

type AbstractClass<T> = abstract new (...args: any[]) => T;


type CommonKeys<TSrc, TDst> = {
    [K in (keyof TSrc & keyof TDst & string) /*as TSrc[K] extends Bindable<TDst[K]> ? K : never*/]: TSrc[K]
};

type FunctionLike = (...args: any[]) => any;

type KeyOfType<TObj, TKey> = {
    [P in keyof TObj & string]: TObj[P] extends TKey ? P : never
}[keyof TObj & string];


type BindThis<T, ThisArg> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (this: ThisArg, ...args: A) => R
    : T[K];
};
