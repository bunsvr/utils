import { EmptyObject } from "./helpers";

export namespace cs {
    /**
     * Parse a cookie header into an object
     */
    export function parse(header: string) {
        var eqIndex = header.indexOf('=');
        if (eqIndex === -1) return new EmptyObject;

        ++eqIndex;
        var start = 0, o = new EmptyObject,
            end = header.indexOf(';', eqIndex);

        do {
            // Return directly if last ';' not found
            if (end === -1) {
                o[header.substring(start, eqIndex - 1).trim()] = header.substring(eqIndex).trim();
                return o;
            }

            // Slice out the key and the value
            o[header.substring(start, eqIndex - 1).trim()] = header.substring(eqIndex, end).trim();

            // Search for next '='
            eqIndex = header.indexOf('=', eqIndex);
            if (eqIndex === -1)
                return o;

            ++eqIndex;

            start = end + 1;
            end = header.indexOf(';', eqIndex);
        } while (true);
    }
}

export const cookie = cs.parse;
