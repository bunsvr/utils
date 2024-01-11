import { expect, test } from 'bun:test';
import { cs } from '..';

test('Cookie builder', () => {
    const cookie = cs.builder({
        secure: true,
        sameSite: 'Strict'
    }), res = cookie();

    res.set.a = 'b';
    res.set.b = true;

    expect(res.value).toBe('Secure;SameSite=Strict;a=b;b');
});
