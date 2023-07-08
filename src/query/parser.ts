import { decodeURIComponent as decode } from './decodeURI';

const plusRegex = /\+/g;

/**
 * Parse a query
 * @param input 
 */
export function query<T extends Record<string, any> = Record<string, string | string[]>>(input: string): T {
    const inputLength = input.length, result = {};
    let key = '', value = '', startingIndex = -1, equalityIndex = -1, shouldDecodeKey = false, shouldDecodeValue = false, 
        keyHasPlus = false, valueHasPlus = false, hasBothKeyValuePair = false, charCode = 0, i = 0;
    // Have a boundary of input.length + 1 to access last pair inside the loop.
    while (i <= inputLength) {
        if (i === inputLength) charCode = 38;
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

export * from './decodeURI';
