export interface Func<Input, Output> {
    (d: Input): Output | null;
    isAsync?: boolean;
}

type Unwrap<T> = T extends Promise<infer R> ? R : T;
type Wrap<Input, T> = Input extends Promise<any> ? (T extends Promise<any> ? T : Promise<T>) : T;

const
    vars = {
        input: 'd',
        func: 'f',
        fallback: 'c'
    },
    // Get call arguments (Trailing ';')
    getArgs = (fn: Func<any, any>) => fn.length > 0
        ? '(' + vars.input + ');' : '();';

export class Chain<Output> {
    // Store preprocessed info
    readonly list: Func<any, any>[];
    readonly names: string[];
    readonly args: string[];

    fallback: Func<any, any> = null;

    async: boolean;

    constructor(input: Func<any, Output>) {
        this.async = input.isAsync = input.constructor.name === 'AsyncFunction';

        // First function in the chain
        this.list = [input];
        this.names = [vars.func + '0'];
        this.args = [getArgs(input)];
    }

    /**
     * Chain another function
     */
    then<T>(fn: Func<Unwrap<Output>, T>): Chain<Wrap<Output, T>> {
        if (fn.isAsync = fn.constructor.name === 'AsyncFunction')
            this.async = true;

        // Preprocess function for injection
        this.list.push(fn);
        this.names.push(vars.func + this.names.length);
        this.args.push(getArgs(fn));

        return this as any;
    }

    /**
     * Handle error of the previous function
     */
    fail(fn: Func<any, any>) {
        this.fallback = fn;

        return this;
    }

    /**
     * Build the output function
     */
    build(): (d: any) => Output {
        if (this.list.length === 1) return this.list[0];

        // Compose all handlers into a single function
        const
            parts = [
                'return ', (this.async ? 'async ' : ''),
                vars.input, '=>{'
            ],

            // The fallback statement
            fallback = `if(${vars.input}===null)`
                + `return ${this.fallback === null
                    ? 'null;' : vars.fallback + getArgs(this.fallback)
                }`;

        // Call the function, store result into input variable and null check
        for (var i = 0; i < this.names.length; ++i)
            parts.push(
                vars.input, '=', this.list[i].isAsync ? 'await ' : '',
                this.names[i], this.args[i], fallback
            );

        // Return the last function result
        parts.push('return ', vars.input, '}');

        // Put into the function
        return Function(
            ...this.names, vars.fallback,
            parts.join('')
        )(...this.list, this.fallback);
    }
};
