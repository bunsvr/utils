import { EmptyObject } from "./helpers";

export namespace cs {
    /**
     * Parse a cookie header into an object
     */
    export function parse(cookie: string) {
        var o = new EmptyObject, str: string, eqIndex: number;

        for (str of cookie.split(';')) {
            // Search for `=` in the part (a key name must be presented)
            eqIndex = str.indexOf('=');
            switch (eqIndex) {
                // No key
                case 0: break;

                // No value specified
                case -1:
                    o[str.trim()] = true;
                    break;

                default:
                    o[str.substring(0, eqIndex).trim()] = str.substring(eqIndex + 1).trim();
            }
        }

        return o;
    }

    /**
     * All cookie options
     */
    export interface Options {
        domain?: string;
        expires?: Date;
        httpOnly?: boolean;
        maxAge?: number;
        partitioned?: boolean;
        path?: string;
        secure?: boolean;
        sameSite?: 'Strict' | 'Lax' | 'None' | 'strict' | 'lax' | 'none' | (string & {});
    }

    export interface Cookie {
        /**
         * Current cookie string 
         */
        value: string;

        /**
         * Add another cookie key value pair
         */
        set(key: string, value: string | true): this;
    }

    /**
     * Cookie value builder
     */
    export class Builder {
        value: string = '';

        constructor(options: cs.Options = {}) {
            if (options.domain)
                this.value += `Domain=${options.domain};`;

            if (options.expires)
                this.value += `Expires=${options.expires};`;

            if (options.httpOnly)
                this.value += 'HttpOnly;';

            if (options.maxAge)
                this.value += `Max-Age=${options.maxAge};`;

            if (options.partitioned)
                this.value += `Partitioned;`;

            if (options.path)
                this.value += `Path=${options.path};`;

            if (options.secure)
                this.value += 'Secure;';

            if (options.sameSite) {
                // Normalize same site
                options.sameSite = options.sameSite[0].toUpperCase() + options.sameSite.substring(1);
                this.value += `SameSite=${options.sameSite};`;
            }
        }

        // Create another instance
        create(): new () => Cookie {
            function C() { };
            C.prototype = Object.create(null);
            C.prototype.value = this.value;
            C.prototype.set = setFn;
            // @ts-ignore
            return C;
        }
    }
}

function setFn(key: string, value: string | true) {
    this.value += (value === true ? key : (key + '=' + value)) + ';';
    return this;
}

export const cookie = cs.parse;
