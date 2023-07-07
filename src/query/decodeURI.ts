const UTF8_DATA = [
    // The first part of the table maps bytes to character to a transition.
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7,
    10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,

    // The second part of the table maps a state to a new state when adding a
    // transition.
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    12, 0, 0, 0, 0, 24, 36, 48, 60, 72, 84, 96,
    0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 24, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,

    // The third part maps the current transition to a mask that needs to apply
    // to the byte.
    0x7F, 0x3F, 0x3F, 0x3F, 0x00, 0x1F, 0x0F, 0x0F, 0x0F, 0x07, 0x07, 0x07
];

/**
 * String from char code
 */
const c = String.fromCharCode;

// UTF8_ACCEPT: 12
// UTF8_REJECT: 0
export function decodeURIComponent(uri: string) {
    let percentPosition = uri.indexOf('%');
    if (percentPosition === -1) return uri;

    const length = uri.length;
    let decoded = '',
        last = 0,
        codepoint = 0,
        startOfOctets = percentPosition,
        state = 12,
        // Loop stuff
    high: number, low: number, byte: number, type: number;

    while (percentPosition > -1 && percentPosition < length) {
        high = hexCodeToInt(uri[percentPosition + 1], 4);
        low = hexCodeToInt(uri[percentPosition + 2], 0);
        byte = high | low;
        type = UTF8_DATA[byte];
        state = UTF8_DATA[256 + state + type];
        codepoint = (codepoint << 6) | (byte & UTF8_DATA[364 + type]);

        if (state === 12) {
            decoded += uri.substring(last, startOfOctets);

            if (codepoint <= 0xFFFF)
                decoded += c(codepoint);
            else
                decoded += c(
                    (0xD7C0 + (codepoint >> 10)),
                    (0xDC00 + (codepoint & 0x3FF))
                );

            codepoint = 0;
            last = percentPosition + 3;
            percentPosition = startOfOctets = uri.indexOf('%', last);
        }
        else if (state === 0) return uri;
        else {
            percentPosition += 3;
            if (
                percentPosition < length
                && uri.charCodeAt(percentPosition) === 37
            ) continue;

            return uri;
        }
    }

    return decoded + uri.substring(last);
}

const HEX = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'a': 10,
    'A': 10,
    'b': 11,
    'B': 11,
    'c': 12,
    'C': 12,
    'd': 13,
    'D': 13,
    'e': 14,
    'E': 14,
    'f': 15,
    'F': 15
}

function hexCodeToInt(c: string, shift: number) {
    const t = HEX[c];
    if (t === undefined)
        return 255;
    return t << shift;
}
