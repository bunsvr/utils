import { EmptyObject } from "./helpers";

export namespace cs {
    /**
     * Parse a cookie header into an object
     */
    export function parse(cookie: string) {
        var eqIndex = cookie.indexOf('=');
        if (eqIndex === -1) return new EmptyObject;

        ++eqIndex;
        var start = 0, o = new EmptyObject,
            end = cookie.indexOf(';', eqIndex);

        do {
            // Return directly if last ';' not found
            if (end === -1) {
                o[cookie.substring(start, eqIndex - 1).trim()] = cookie.substring(eqIndex).trim();
                return o;
            }

            // Slice out the key and the value
            o[cookie.substring(start, eqIndex - 1).trim()] = cookie.substring(eqIndex, end).trim();

            // Search for next '='
            eqIndex = cookie.indexOf('=', eqIndex);
            if (eqIndex === -1)
                return o;

            ++eqIndex;

            start = end + 1;
            end = cookie.indexOf(';', eqIndex);
        } while (true);
    }
}

export const cookie = cs.parse;
