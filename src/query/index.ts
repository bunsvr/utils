import { EmptyObject } from '../helpers';
import { decodeURIComponent as decode } from './decodeURI';

const plusRegex = /\+/g;

type FixedSizeArray<N extends number, T> = N extends 0 ? never[] : {
    0: T;
    length: N;
} & ReadonlyArray<T>;

export namespace qs {
    /**
     * Parse a query
     * @param input 
     */
    export function parse<T extends Record<string, any> = Record<string, string | string[]>>(input: string): T {
        const result = new EmptyObject;
        let key = '', value = '', startingIndex = -1, equalityIndex = -1, shouldDecodeKey = false, shouldDecodeValue = false,
            keyHasPlus = false, valueHasPlus = false, hasBothKeyValuePair = false, charCode = 0, i = 0;
        // Have a boundary of input.length + 1 to access last pair inside the loop.
        while (i <= input.length) {
            if (i === input.length) charCode = 38;
            else charCode = input.charCodeAt(i);
            // Handle '&' and end of line to pass the current values to result
            switch (charCode) {
                case 38:
                    hasBothKeyValuePair = equalityIndex > startingIndex;
                    // Optimization: Reuse equality index to store the end of key
                    if (!hasBothKeyValuePair) equalityIndex = i;
                    key = input.substring(startingIndex + 1, equalityIndex);
                    // Add key/value pair only if the range size is greater than 1; a.k.a. contains at least '='
                    if (hasBothKeyValuePair || key.length > 0) {
                        // Optimization: Replace '+' with space
                        if (keyHasPlus) key = key.replace(plusRegex, ' ');
                        // Optimization: Do not decode if it's not necessary.
                        if (shouldDecodeKey) key = decode(key);
                        if (hasBothKeyValuePair) {
                            value = input.substring(equalityIndex + 1, i);
                            if (valueHasPlus) value = value.replace(plusRegex, ' ');
                            if (shouldDecodeValue) value = decode(value);
                        }
                        const currentValue = result[key];
                        if (currentValue === undefined) result[key] = value;
                        else {
                            if (currentValue.pop === undefined) result[key] = [currentValue, value];
                            else currentValue.push(value);
                        }
                    }
                    // Reset reading key value pairs
                    value = '';
                    startingIndex = equalityIndex = i;
                    shouldDecodeKey = shouldDecodeValue = keyHasPlus = valueHasPlus = false;
                    break;
                // Check '='
                case 61:
                    if (equalityIndex <= startingIndex) equalityIndex = i;
                    // If '=' character occurs again, we should decode the input.
                    else shouldDecodeValue = true;
                    break;
                // Check '+', and remember to replace it with empty space.
                case 43:
                    if (equalityIndex > startingIndex) valueHasPlus = true;
                    else keyHasPlus = true;
                    break;
                // Check '%' character for encoding
                case 37:
                    if (equalityIndex > startingIndex) shouldDecodeValue = true;
                    else shouldDecodeKey = true;
                    break;
            }
            ++i;
        }
        return result as T;
    }

    /**
     * A query parser function
     */
    export interface Parser<T> {
        (req: Request): T;
    }

    /**
     * Create a parser that only search the first value of a specific key in the query.
     *
     * Note that the value is not decoded so you need to manually decode using `decodeURIComponent` if needed
     */
    export function searchKey(key: string): Parser<string | null>;

    /**
     * Create a parser that only search the first value of a specific key in the query.
     *
     * Note that the value is not decoded so you need to manually decode using `decodeURIComponent` if needed
     */
    export function searchKey(key: string, maxValues: 1): Parser<string | null>;

    /**
     * Create a parser that only search values of a specific key in the query.
     *
     * Note that the value is not decoded so you need to manually decode using `decodeURIComponent` if needed
     */
    export function searchKey<T extends number>(key: string, maxValues: T): Parser<FixedSizeArray<T, string>>;

    export function searchKey<T extends number = 1>(
        key: string,
        maxValues: T = 1 as any
    ): Parser<string> | Parser<FixedSizeArray<T, string>> {
        key = encodeURIComponent(key) + '=';

        let body = 'return function(_)', noMaxVal = maxValues === 1, len = key.length;
        body += noMaxVal
            ? (
                '{let i=_.url.indexOf(k,_.query+1);if(i===-1)return null;'
                + `i+=${len};const j=_.url.indexOf('&',i);return j===-1?_.url.substring(i):_.url.substring(i,j)}`
            ) : (
                '{const r=new Array(m);let i=0,j=_.url.indexOf(k,_.query+1),e;'
                + `while(j!==-1&&i<m){`
                + `j+=${len};e=_.url.indexOf('&',j);`
                + `if(e===-1){r[i]=_.url.substring(j);return r;}`
                + `r[i]=_.url.substring(j,e);++i;j=_.url.indexOf(k,e+1);`
                + `}`
                + 'return r;}'
            );

        return (noMaxVal ? Function('k', body) : Function('k', 'm', body))(key, maxValues);
    }
}

// Alias
export const query = qs.parse;
export * from './decodeURI';
