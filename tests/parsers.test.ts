/// <reference types='bun-types' />
import { expect, test } from 'bun:test';
import { qs } from '..';

console.log(qs);

test('Query parser', () => {
    const str = 'name=a&name=b&age=20';
    expect(qs.parse(str)).toEqual({
        name: ['a', 'b'],
        age: '20'
    });
});

test('Key query parser', () => {
    const parse = qs.searchKey('name');
    console.log(parse.toString());

    // @ts-ignore
    expect(parse({ url: 'a=d?name=b', query: -1 })).toBe('b');
});

test('Key query parser multiple values', () => {
    const parse = qs.searchKey('name', 2);
    console.log(parse.toString());

    // @ts-ignore
    expect(parse({ url: 'name=a&o=a&name=b', query: -1 })).toEqual(['a', 'b']);
});
