import { expect, test } from 'bun:test';
import { cs } from '..';

test('Cookie parser', () => {
    expect(cs.parse('name=reve;id=1')).toEqual({
        name: 'reve',
        id: '1'
    });

    const parse = cs.parser('a', 'b');
    console.log(parse.toString());

    expect(parse(
        new Request('http://localhost', {
            headers: { Cookie: 'a;b=a' }
        })
    )).toEqual({
        a: true,
        b: 'a'
    });
});

test('Cookie builder', () => {
    const Cookie = new cs.Builder({
        secure: true,
        sameSite: 'strict'
    }).create();

    const cookie = new Cookie()
        .set('a', 'b')
        .set('b', true);

    expect(cookie.value).toBe('Secure;SameSite=Strict;a=b;b');
});
