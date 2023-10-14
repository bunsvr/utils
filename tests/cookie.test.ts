import { expect, test } from 'bun:test';
import { cookie } from '..';

test('Cookie parser', () => {
    expect(cookie('name=reve;id=1')).toEqual({
        name: 'reve',
        id: '1'
    });
});
