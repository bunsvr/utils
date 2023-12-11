export interface TypeMap {
    bool: boolean;
    str: string;
    num: number;
    obj: object;
    undef: undefined;
    nil: null;
    snum: number;
    sobj: object;
}

export type TypeInfer<K extends string> = K extends keyof TypeMap ? TypeMap[K] : any;

export type TypeKeys = keyof TypeMap | (string & {});
