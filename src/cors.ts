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

function setHeader(headers: object, name: string, value: string | string[]) {
    if (!Array.isArray(value))
        value = [value];

    headers[name] = value.join(', ');
}

const allowOriginHeader = 'Access-Control-Allow-Origin';

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
        const headers: CORS.Headers = {};

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

        this.headers = Object.seal(headers);
        this.composeCheck();
    }

    composeCheck() {
        let origins = this.options.allowOrigins;
        if (!origins || origins.length === 0 || origins === '*') 
            return this.check = Function('a','return function(){return a}')(this.headers);

        if (origins && origins.length === 1) origins = origins[0];

        const body =`const v='Access-Control-Allow-Origin',y='Origin'${
            typeof origins === 'string' ? (origins === '*' 
                ? '' 
                : `,h0='${origins}'`
            ) : origins.map(
                (value, i) => `,h${i}='${value}'` 
            ).join('')
        };return function(r){const c={...a};${
            typeof origins === 'string' ? `if(r===h0){c[v]=r;c.Vary=y;}` : `switch(r){${
                origins.map((_, i) => `case h${i}:`).join('')
            }c[v]=r;c.Vary=y}`
        }return c}`;

        this.check = Function('a', body)(this.headers);
    }

    /**
     * Return CORS headers including 'Access-Control-Allow-Origin'
     * @param requestOrigin The origin to check
     * @returns The CORS headers
     */
    check(requestOrigin: string) {
        // Shallow copy
        const headers = { ...this.headers } as CORS.Headers;

        const origins = this.options.allowOrigins;
        if (origins === undefined || origins.length === 0)
            return headers;

        // @ts-ignore distinguish between string and string[]
        if (origins.pop === undefined) 
            headers[allowOriginHeader] = origins as string;
        else if (origins.includes(requestOrigin))
            headers[allowOriginHeader] = requestOrigin;

        // If value is not all origin set the 'Vary' header
        if (headers[allowOriginHeader] !== '*')
            headers['Vary'] = 'Origin';

        return headers;
    }
}

export { CORS };
