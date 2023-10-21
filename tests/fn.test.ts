/// <reference types='bun-types' />
import { expect, test } from 'bun:test';
import { fn } from '..';

test('Basic', async () => {
    const x = { value: 1 };

    const f = fn.basic(
        async (o: typeof x) => (++o.value, o)
    ).then(
        o => (o.value += 2, o)
    ).then(
        o => (o.value <<= 1, o)
    ).then(
        async o => (o.value *= 3, o.value)
    ).build();

    console.log(f.toString());
    expect(await f(x)).toBe(24);
});

