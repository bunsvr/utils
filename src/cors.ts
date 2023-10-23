import { createCopy, EmptyObject } from "./helpers";

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
     * Create an object to get CORS header
     * @param options CORS options
     */
    constructor(public readonly options: CORS.Options = {}) {
        const headers: CORS.Headers = new EmptyObject;

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

        this.headers = headers;
        this.head = createCopy(headers);

        // Same function cuz it does not depends on the origin passed in
        if (this.build() === null)
            this.check = this.head;
    }

    build() {
        const origins = this.options.allowOrigins, originIsStr = typeof origins === 'string';
        if (!origins || origins.length === 0 || origins === '*') return null;

        this.headers.Vary = 'Origin';
        this.headers['Access-Control-Allow-Origin'] = originIsStr ? origins : origins[0];

        // Access-Control-Allow-Origin is not needed to be set dynamically in this case
        if (originIsStr || origins.length === 1) return false;

        let body = `return r=>{var c=${JSON.stringify(this.headers)};switch(r){`;

        // Get the case statement check 
        let i = 1;
        while (i < origins.length) {
            body += `case'${origins[i]}':`;
            ++i;
        }

        body += `c['Access-Control-Allow-Origin']=r;break}return c}`;

        // Compose functions
        this.check = Function(body)();
    }
}

interface CORS {
    /**
     * Return CORS headers including 'Access-Control-Allow-Origin'
     * @param requestOrigin The origin to check
     * @returns The CORS headers
     */
    check(requestOrigin: string): CORS.Headers;

    /**
     * Return a copy of the headers 
     */
    head(): CORS.Headers;
}

export { CORS };
