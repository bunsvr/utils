/// <reference types='bun-types' />
import { expect, test } from 'bun:test';
import { fn } from '..';

test('Basic', async () => {
    // Use basic fn type
    const f = fn.input((o: number) => o + 1)
        .then(o => o << 2)
        .then(async t => t << 5)
        // Build the chain
        .build();

    console.log(f.toString());
    expect(await f(1)).toBe(256);
});

