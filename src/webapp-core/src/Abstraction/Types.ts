
export type IfEquals<X, Y, A = X, B = never> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? A : B;

export type WritableKeys<T, TProp> = {
    [P in keyof T]-?: T[P] extends TProp ? IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P> : never
}[keyof T];

export type EmptyConstructor<T> = { new(): T }

export type OptionsFor<T> = {
    [K in keyof T as K extends string ? K extends "options" ? never : (T[K] extends Function ? never : K) : never] : T[K]
}

export type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;


export type StringLike = string | number | object | boolean | { toString(): string }


export type Class<T> = { new(...args: []): T };

export type CommonKeys<TSrc, TDst> = {
    [K in (keyof TSrc & keyof TDst & string) /*as TSrc[K] extends Bindable<TDst[K]> ? K : never*/]: TSrc[K]
};
