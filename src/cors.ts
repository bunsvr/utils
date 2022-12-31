/**
 * All request methods
 */
export type RequestMethod = 'ACL' | 'BIND' | 'CHECKOUT' | 'CONNECT' | 'COPY' | 'DELETE' | 'GET' | 'HEAD' | 'LINK' | 'LOCK' | 'M-SEARCH' | 'MERGE' | 'MKACTIVITY' | 'MKCALENDAR' | 'MKCOL' | 'MOVE' | 'NOTIFY' | 'OPTIONS' | 'PATCH' | 'POST' | 'PRI' | 'PROPFIND' | 'PROPPATCH' | 'PURGE' | 'PUT' | 'REBIND' | 'REPORT' | 'SEARCH' | 'SOURCE' | 'SUBSCRIBE' | 'TRACE' | 'UNBIND' | 'UNLINK' | 'UNLOCK' | 'UNSUBSCRIBE';

/**
 * CORS types
 */
export namespace CORS {
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

/**
 * Parse CORS options
 * @param options The CORS options
 * @param requestOrigin Current request origin
 * @returns The CORS Headers
 */
export function cors(options: CORS.Options, requestOrigin: string) {
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

    // Set the header value
    let value: string;
    const origins = options.allowOrigins;
    if (Array.isArray(origins)) {
        if (origins.includes(requestOrigin))
            value = requestOrigin;
        else
            value = origins[0] || "";
    }
    else
        value = origins as string;

    // If value is not all origin
    if (value !== "*")
        headers["Vary"] = "Origin";

    headers["Access-Control-Allow-Origin"] = value;
    return headers;
}