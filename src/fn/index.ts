import { type Func as ChainFunc, Chain } from './chain';

// Declarations
export namespace fn {
    /**
     * Chain guard functions with type safety.
     */
    export declare function input<T>(fn: ChainFunc<any, T>): Chain<T>;
}

// Implementation
fn.input = f => new Chain(f);
