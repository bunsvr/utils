import { expect, test } from 'bun:test';
import { cs } from '..';

test('Cookie builder', () => {
    const Cookie = new cs.Builder({
        secure: true,
        sameSite: 'Strict'
    }).create();

    const cookie = new Cookie()
        .set('a', 'b')
        .set('b', true);

    expect(cookie.get()).toBe('Secure;SameSite=Strict;a=b;b');
});
