import { Fn as BasicFn, Func as BasicFunc } from "./basic";

export namespace fn {
    /**
     * Do basic chaining like checking with objects. Return `null` to end the process.
     */
    export function basic<T>() {
        return {
            use<R>(f: BasicFn<T, R>) {
                return new BasicFunc(f);
            }
        }
    }
}
