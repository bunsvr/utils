/// <reference types='bun-types' />
import { test, expect } from 'bun:test';
import { guard } from '..';

test('Simple guard', () => {
    const check = guard.create({
        name: 'str',
        age: 'num?',
        registered: 'bool'
    });
    console.log(check.toString());

    expect(check({
        name: 'Reve',
        registered: true
    })).not.toBeNil();

    expect(check({
        age: 15
    })).toBeNil();

    expect(check({
        registered: false
    })).toBeNil();
});

test('Nested', () => {
    const check = guard.create({
        id: 'num',
        data: {
            name: 'str',
            address: 'str?'
        }
    });
    console.log(check.toString());

    expect(check({
        id: 1,
        data: {
            name: 'a'
        }
    })).not.toBeNil();
});
