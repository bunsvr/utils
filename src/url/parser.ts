/**
 * Only use when only one part of the URL is needed, otherwise use the `URL` native API
 */
export namespace URLParser {
    /**
     * Get path from URL
     * @param u URL 
     */
    export function path(u: string) {
        const s = u.indexOf('/', 12), e = u.indexOf('?', s + 1);
        if (e === -1) return u.substring(s);
        return u.substring(s, e);
    }

    /**
     * Get query from URL without `?`
     * @param u an URL with the same format as Bun `req.url`
     */
    export function query(u: string) {
        const s = u.indexOf('?');
        if (s === -1) return '';

        const e = u.indexOf('#');
        if (e === -1) return u.substring(s + 1);

        return u.substring(s + 1, e);
    }

    /**
     * Get the scheme name of an URL
     * @param u an URL with the same format as Bun `req.url`
     */
    export function scheme(u: string) {
        return u.substring(0, u.indexOf(':'));
    }

    /**
     * Get hash from URLs without `#`
     * @param u an URL with the same format as Bun `req.url` 
     */
    export function hash(u: string) {
        const s = u.indexOf('#');
        if (s === -1) return '';
        return u.substring(s + 1);
    }

    /**
     * Return the host with the port
     * @param u an URL with the same format as Bun `req.url`
     */
    export function host(u: string) {
        const s = u.indexOf(':') + 3;
        return u.substring(s, u.indexOf('/', s));
    }
}
