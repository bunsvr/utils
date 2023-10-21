/// <reference types='bun-types' />
import { expect, test } from 'bun:test';
import { fn } from '..';

test('Basic', async () => {
    const x = { value: 1 };

    // Use basic fn type
    const f = fn.basic<typeof x>()
        // Start with the first function
        .use(async o => (++o.value, o))
        // Perform validations
        .then(o => o.value < 2
            ? null
            : (o.value += 2, o))
        // Next function
        .then(o => (o.value <<= 1, o))
        // Last step return the value
        .then(async o => (o.value *= 3, o.value))
        // Build the chain
        .build();

    console.log(f.toString());
    expect(await f(x)).toBe(24);
});

