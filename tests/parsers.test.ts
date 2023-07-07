/// <reference types='bun-types' />
import { expect, test } from 'bun:test';
import { URLParser, query } from '..';

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
    expect(query(str)).toEqual({
        name: ['a', 'b'],
        age: '20'
    });
});