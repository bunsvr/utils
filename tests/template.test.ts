import { test, expect } from 'bun:test';
import { template } from '..';

test('Simple', () => {
    const t = template.create(`<p>$( a: str )</p>$( b: num )`);
    console.log(t.toString())

    expect(t({ a: 'Hi', b: 8 })).toBe(`<p>Hi</p>8`);
});
