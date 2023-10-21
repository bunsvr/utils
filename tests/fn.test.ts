/// <reference types='bun-types' />
import { expect, test } from 'bun:test';
import { fn } from '..';

test('Basic', () => {
    const o = { value: 1 };

    const f = fn.basic(
        (i: typeof o) => (++i.value, i)
    ).then(o => o.value << 1).build();

    console.log(f.toString());
    expect(f(o)).toBe(4);
});

