import { EmptyObject, isVariable } from "./helpers";

export namespace cs {
    /**
     * Represent a cokie value
     */
    export type Value = string | true;

    /**
     * Parse a cookie header into an object
     */
    export declare function parse(cookie: string): Dict<Value>;
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

            if (this.value.endsWith(';'))
                this.value = this.value.substring(0, this.value.length - 1);
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

    /**
     * Create a parser using linear check
     */
    export function parser<Keys extends string[]>(...keys: Keys): (req: Request) => Record<Keys[number], Value | null> | null {
        // Initialize prototype
        let key: string, P = function() { }, accessor: string;
        P.prototype = new EmptyObject;
        for (key of keys)
            P.prototype[key] = null;

        let body = `return r=>{`, started = false;

        // Validation
        body += `var s=r.headers.get('Cookie');if(s===null)return null;`;

        // Search every key
        body += `var o=new C,k,e,p=s.split(';');for(k of p){k=k.trimStart();`

        for (key of keys) {
            body += (started ? 'else ' : '') + `if(k.startsWith('${key}')){e=k.indexOf('=',${key.length});`;
            accessor = isVariable.test(key) ? '.' + key : `['${key}']`;

            body += `o${accessor}=e===-1||k.substring(e+1).trim()}`;
            started = true;
        }

        body += '}return o}';
        return Function('C', body)(P);
    }
}

// Arrow functions are faster
cs.parse = cookie => {
    var o = new EmptyObject, str: string, eqIndex: number, sp = cookie.split(';');

    for (str of sp) {
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

function setFn(key: string, value: string | true) {
    this.value += ';' + (value === true ? key : (key + '=' + value));
    return this;
}

export const cookie = cs.parse;
