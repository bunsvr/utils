import { stream } from '..';
import { test, expect } from 'bun:test';

const decoder = new TextDecoder;

test('Stream async iterable', async () => {
    async function* gen(n: string[]) {
        for (var msg of n) yield msg;
    }

    const msgList = ['Hi', 'there'],
        s = stream.iter(gen(msgList));

    // This is actually sync
    for await (const chunk of s)
        expect(decoder.decode(chunk)).toBe(msgList.join(''));
});


