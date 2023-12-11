export type TrimStart<T extends string> = T extends ` ${infer R}` ? TrimStart<R> : T;

export type TrimEnd<T extends string> = T extends `${infer R} ` ? TrimEnd<R> : T;

export type Trim<T extends string> = TrimStart<TrimEnd<T>>;

