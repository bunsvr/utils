/// <reference types='bun-types' />
import { expect, test } from 'bun:test';
import { URLParser, qs } from '..';

const url = 'https://example.com:8080/path?a=b#hi';
test('URL parser', () => {
    expect(URLParser.hash(url)).toBe('hi');
    expect(URLParser.host(url)).toBe('example.com:8080');
    expect(URLParser.path(url)).toBe('/path');
    expect(URLParser.query(url)).toBe('a=b');
    expect(URLParser.scheme(url)).toBe('https')
});

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
    expect(parse({url: 'a=d?name=b', query: -1})).toBe('b');
});

test('Key query parser multiple values', () => {
    const parse = qs.searchKey('name', 2);
    console.log(parse.toString());

    // @ts-ignore
    expect(parse({url: 'name=a&o=a&name=b', query: -1})).toEqual(['a', 'b']);
})
