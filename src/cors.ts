import type { Context } from '@stricjs/app';
import { EmptyObject, createExtend } from './helpers';

/**
 * All request methods
 */
export type RequestMethod = 'ACL' | 'BIND' | 'CHECKOUT' | 'CONNECT' | 'COPY' | 'DELETE' | 'GET' | 'HEAD' | 'LINK' | 'LOCK' | 'M-SEARCH' | 'MERGE' | 'MKACTIVITY' | 'MKCALENDAR' | 'MKCOL' | 'MOVE' | 'NOTIFY' | 'OPTIONS' | 'PATCH' | 'POST' | 'PRI' | 'PROPFIND' | 'PROPPATCH' | 'PURGE' | 'PUT' | 'REBIND' | 'REPORT' | 'SEARCH' | 'SOURCE' | 'SUBSCRIBE' | 'TRACE' | 'UNBIND' | 'UNLINK' | 'UNLOCK' | 'UNSUBSCRIBE';

/**
 * CORS types
 */
declare namespace CORS {
    /**
     * CORS Options
     */
    export interface Options {
        /**
         * 'Access-Control-Allow-Origin' header
         */
        allowOrigins?: string | string[];
        /**
         * 'Access-Control-Allow-Methods' header
         */
        allowMethods?: string | RequestMethod | RequestMethod[];
        /**
         * 'Access-Control-Expose-Headers' header
         */
        exposeHeaders?: string | string[];
        /**
         * 'Access-Control-Max-Age' header
         */
        maxAge?: number;
        /**
         * 'Access-Control-Allow-Credentials' header
         */
        allowCredentials?: boolean;
        /**
         * 'Access-Control-Allow-Headers' header
         */
        allowHeaders?: string | string[];
    }

    type HeadersName = 'Access-Control-Max-Age' | 'Access-Control-Allow-Credentials' | 'Access-Control-Allow-Headers'
        | 'Access-Control-Expose-Headers' | 'Access-Control-Allow-Methods' | 'Vary' | 'Access-Control-Allow-Origin';

    /**
     * CORS Headers
     */
    export type Headers = {
        [key in HeadersName]?: string;
    };
}

const setHeader = (headers: object, name: string, value: string | string[]) => {
    if (!Array.isArray(value))
        value = [value];

    headers[name] = value.join(',');
}

class CORS {
    /**
     * All CORS headers exclude 'Access-Control-Allow-Origin'
     */
    readonly headers: CORS.Headers;

    /**
     * Whether headers can be sent directly without any checks
     */
    readonly static: boolean;

    /**
     * Create an object to get CORS header
     * @param options CORS options
     */
    constructor(public readonly options: CORS.Options = {}) {
        const headers: CORS.Headers = new EmptyObject;

        // All static options
        if (options.maxAge)
            headers['Access-Control-Max-Age'] = String(options.maxAge);
        if (options.allowCredentials)
            headers['Access-Control-Allow-Credentials'] = 'true';
        if (!options.allowOrigins)
            options.allowOrigins = '*';
        if (options.allowOrigins === '*')
            headers['Access-Control-Allow-Origin'] = '*';

        if (options.allowHeaders)
            setHeader(headers, 'Access-Control-Allow-Headers', options.allowHeaders);
        if (options.exposeHeaders)
            setHeader(headers, 'Access-Control-Expose-Headers', options.exposeHeaders);
        if (options.allowMethods)
            setHeader(headers, 'Access-Control-Allow-Methods', options.allowMethods);

        // Request origin check
        const origins = this.options.allowOrigins;
        if (!origins || origins.length === 0 || origins === '*')
            this.static = true;
        else {
            const originIsStr = typeof origins === 'string',
                isStatic = originIsStr || origins.length === 1;

            headers.Vary = 'Origin';
            headers['Access-Control-Allow-Origin'] = originIsStr ? origins : origins[0];

            this.static = isStatic;
            const assign = this.assign = createExtend(headers);

            // Single or no origin
            if (isStatic) {
                this.assign = createExtend(headers);

                this.validate = headers => {
                    assign(headers);
                    return headers;
                }

                this.set = ctx => assign(ctx.headers);
                this.write = Function(`return c=>{c.headers=${JSON.stringify(headers)}}`)();
            }

            // Multiple origins
            else {
                // Origin check using map
                const originMap = {};
                for (let i = 0, len = origins.length; i < len; ++i)
                    originMap[origins[i]] = null;

                // Assign every props
                const validate = (this.validate = (headers, requestOrigin) => {
                    assign(headers);
                    if (typeof originMap[requestOrigin] !== 'undefined')
                        headers['Access-Control-Allow-Origin'] = requestOrigin;
                });

                this.set = ctx => validate(ctx.headers as {}, ctx.req.headers.get('Origin'));
                this.write = Function('m',
                    `return c=>{c.headers=${JSON.stringify(headers)};`
                    + `const o=c.req.headers.get('Origin');if(typeof m[o]!=='undefined')c.headers['Access-Control-Allow-Origin']=o}`
                )(originMap);
            }
        }

        this.headers = headers;
    }
}

/**
 * Cross-origin resource sharing headers
 */
interface CORS {
    /**
     * Set CORS headers
     */
    validate<T extends object>(headers: T, requestOrigin?: string): void;

    /**
     * Set CORS headers for context. You may register this as a layer handler
     * ```js
     * export const layers = [cors.set];
     * ```
     */
    set(c: Context): void;

    /**
     * Override `ctx.headers`. Can be used as a layer handler like `cors.set`
     */
    write(c: Context): void;

    /**
     * Assign static headers
     */
    assign(headers: object): void;
}

export { CORS };
