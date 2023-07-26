/// <reference types='bun-types' />
import { test, expect } from 'bun:test';
import { guard } from '..';

test('Simple guard', () => {
    const check = guard.create({
        name: 'str',
        age: '?num',
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
            address: '?str'
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

test('Buffer', () => {
    const check = guard.create('?bf');
    console.log(check.toString());

    expect(check(Buffer.allocUnsafe(1))).not.toBeNil();
    expect(check()).toBeUndefined();
});

test('Register types', () => {
    guard.register('fn', (v: any) => typeof v === 'function');
    // @ts-ignore
    const check = guard.create('fn');
    console.log(check.toString())

    expect(check(() => {})).not.toBeNil();
});
