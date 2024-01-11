import PropsBuilder from './internals/builder';

// Set up the schema
const propsBuilder = new PropsBuilder()
    .put<'domain', string>('domain', 'Domain')
    .put<'expires', Date>('expires', 'Expires')
    .put('httpOnly', 'HttpOnly')
    .put<'maxAge', number>('maxAge', 'Max-Age')
    .put('partitioned', 'Partitioned')
    .put<'path', string>('path', 'Path')
    .put('secure', 'Secure')
    .put<'sameSite', 'Strict' | 'Lax' | 'None'>('sameSite', 'SameSite');

propsBuilder.separator = { kv: '=', end: ';', multiValue: ' ' };

type OptionsInfer = typeof propsBuilder.infer;

/**
 * Cookie string namespace
 */
export namespace cs {
    /**
     * Represent a cookie value
     */
    export type Value = string | true;

    /**
     * All cookie options
     */
    export interface Options extends OptionsInfer { }

    export interface Cookie {
        /**
         * Set cookie props
         */
        set: Record<string, Value>;

        /**
         * Get the cookie value
         */
        readonly value: string;
    }

    /**
     * Cookie value builder
     */
    export function builder(options: cs.Options = {}): () => Cookie {
        const getParts = `const p=${JSON.stringify(
            propsBuilder.build(options)
        )};`
            + "for(var k in set){p.push(';',k);if(set[k]!==true)p.push('=',set[k])};"
            + "return p.join('')";
        return Function(`return ()=>{const set={};return{set,get value(){${getParts}}}}`)();
    }
}
