import PropsBuilder from './internals/builder';

// Set up the schema
const builder = new PropsBuilder()
    .put<'domain', string>('domain', 'Domain')
    .put<'expires', Date>('expires', 'Expires')
    .put('httpOnly', 'HttpOnly')
    .put<'maxAge', number>('maxAge', 'Max-Age')
    .put('partitioned', 'Partitioned')
    .put<'path', string>('path', 'Path')
    .put('secure', 'Secure')
    .put<'sameSite', 'Strict' | 'Lax' | 'None'>('sameSite', 'SameSite');

builder.separator = { kv: '=', end: ';', multiValue: ' ' };

type OptionsInfer = typeof builder.infer;

export namespace cs {
    /**
     * Represent a cokie value
     */
    export type Value = string | true;

    /**
     * All cookie options
     */
    export interface Options extends OptionsInfer { }

    export interface Cookie {
        /**
         * Current cookie string 
         */
        parts: string[];

        /**
         * Add another cookie key value pair
         */
        set(key: string, value: string | true): this;

        /**
         * Returns the cookie string
         */
        get(): string;
    }

    /**
     * Cookie value builder
     */
    export class Builder {
        parts: string[];

        constructor(options: cs.Options = {}) {
            this.parts = builder.build(options);
        }

        // Create another instance
        init(): new () => Cookie {
            function C() { };
            C.prototype = Object.create(null);
            C.prototype.parts = this.parts;
            C.prototype.set = setFn;
            C.prototype.get = getFn;
            // @ts-ignore
            return C;
        }
    }
}

// Functions for the proto
function setFn(this: cs.Cookie, key: string, value: string | true) {
    // The end separator was pop out
    this.parts.push(';', key);
    if (value !== true) this.parts.push('=', value);

    return this;
}

function getFn(this: cs.Cookie) {
    return this.parts.join('');
}
