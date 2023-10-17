import { expect, test } from 'bun:test';
import { cs } from '..';

test('Cookie parser', () => {
    expect(cs.parse('name=reve;id=1')).toEqual({
        name: 'reve',
        id: '1'
    });
});

test('Cookie builder', () => {
    const Cookie = new cs.Builder({
        secure: true,
        sameSite: 'strict'
    }).build();

    const cookie = new Cookie()
        .set('a', 'b')
        .set('b', true);

    expect(cookie.value).toBe('Secure;SameSite=Strict;a=b;b;');
});
