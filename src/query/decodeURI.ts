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

    let decoded = '',
        last = 0,
        codepoint = 0,
        startOfOctets = percentPosition,
        state = 12,
        // Loop stuff
        byte: number;

    do {
        // High
        ++percentPosition;
        byte = uri[percentPosition] in HEX ? (HEX[uri[percentPosition]] << 4) : 255;

        // Low
        ++percentPosition;
        byte = byte | (uri[percentPosition] in HEX ? HEX[uri[percentPosition]] : 255);

        state = UTF8_DATA[256 + state + UTF8_DATA[byte]];
        codepoint = (codepoint << 6) | (byte & UTF8_DATA[364 + UTF8_DATA[byte]]);

        switch (state) {
            case 12:
                decoded += uri.substring(last, startOfOctets);

                if (codepoint < 65536)
                    decoded += c(codepoint);
                else
                    decoded += c(
                        (0xD7C0 + (codepoint >> 10)),
                        (0xDC00 + (codepoint & 0x3FF))
                    );

                codepoint = 0;
                last = percentPosition + 1;
                startOfOctets = uri.indexOf('%', last);
                percentPosition = startOfOctets;

                continue;

            case 0: return uri;
            default:
                ++percentPosition;

                if (
                    percentPosition < uri.length
                    && uri.charCodeAt(percentPosition) === 37
                ) continue;

                return uri;
        }
    } while (percentPosition !== -1);

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
};
