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
         * "Access-Control-Allow-Origin" header
         */
        allowOrigins?: string | string[];
        /**
         * "Access-Control-Allow-Methods" header
         */
        allowMethods?: string | RequestMethod | RequestMethod[];
        /**
         * "Access-Control-Expose-Headers" header
         */
        exposeHeaders?: string | string[];
        /**
         * "Access-Control-Max-Age" header
         */
        maxAge?: number;
        /**
         * "Access-Control-Allow-Credentials" header
         */
        allowCredentials?: boolean;
        /**
         * "Access-Control-Allow-Headers" header
         */
        allowHeaders?: string | string[];
    }

    type HeadersName = "Access-Control-Max-Age" | "Access-Control-Allow-Credentials" | "Access-Control-Allow-Headers"
        | "Access-Control-Expose-Headers" | "Access-Control-Allow-Methods" | "Vary" | "Access-Control-Allow-Origin";

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

    headers[name] = value.join(", ");
}

class CORS {
    /**
     * All CORS headers exclude "Access-Control-Allow-Origin"
     */
    readonly headers: CORS.Headers;

    /**
     * Create an object to get CORS header
     * @param options CORS options
     */
    constructor(public readonly options: CORS.Options) {
        const headers: CORS.Headers = {};

        if (options.maxAge)
            headers["Access-Control-Max-Age"] = String(options.maxAge);
        if (options.allowCredentials)
            headers["Access-Control-Allow-Credentials"] = "true";

        if (options.allowHeaders)
            setHeader(headers, "Access-Control-Allow-Headers", options.allowHeaders);
        if (options.exposeHeaders)
            setHeader(headers, "Access-Control-Expose-Headers", options.exposeHeaders);
        if (options.allowMethods)
            setHeader(headers, "Access-Control-Allow-Methods", options.allowMethods);

        this.headers = Object.seal(headers);
    }

    /**
     * Return CORS headers including "Access-Control-Allow-Origin"
     * @param requestOrigin The origin to check
     * @returns The CORS headers
     */
    check(requestOrigin: string) {
        const headers = { ...this.headers } as CORS.Headers;

        const origins = this.options.allowOrigins;
        if (!origins || !origins[0])
            return headers;

        // If value is not all origin set the "Vary" header
        if ((
            // Set allow origins
            headers["Access-Control-Allow-Origin"] = 
                Array.isArray(origins)
                    // If origins is an array
                    ? (origins.includes(requestOrigin) ? requestOrigin : "")
                    : origins
        ) !== "*")
            headers["Vary"] = "Origin";

        return headers;
    }
}

export { CORS };