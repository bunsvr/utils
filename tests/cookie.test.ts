import { expect, test } from 'bun:test';
import { cs } from '..';

test('Cookie builder', () => {
    const cookie = new cs.Builder({
        secure: true,
        sameSite: 'Strict'
    }).init();

    const res = cookie()
        .set('a', 'b')
        .set('b', true);

    expect(res.get()).toBe('Secure;SameSite=Strict;a=b;b');
});
