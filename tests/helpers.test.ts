import { expect, test } from 'bun:test';
import { createCopy, createExtend, createHTML, decodeURIComponent, extend, html, leftPad, response } from '..';

test('HTML', async () => {
    const staticHTML = '<p></p>';
    const customHTML = createHTML({}, staticHTML);

    expect(await customHTML().text()).toBe(staticHTML);
    expect(await html(staticHTML).text()).toBe(staticHTML);
});

test('Predefined response', async () => {
    const obj = { 'a': 'b' }
    const objRes = response(obj);

    expect(await objRes().json()).toEqual(obj);
});

test('Left pad', () => {
    expect(leftPad('str', 2, ' ')).toBe('  str');
});

test('Decode URI', () => {
    expect(decodeURIComponent('Hi%20there')).toBe('Hi there');
});

test('Extend', () => {
    const a = { a: 1 };
    extend(a, { b: 2 });
    expect(a).toEqual({ a: 1, b: 2 });
});

test('Custom extend', () => {
    const source = { a: 1, 'a-b': 2, o: {} },
        extendObj = createExtend(source),
        o = {};

    console.log(extendObj.toString());

    extendObj(o);
    expect(o).toEqual(source);
});

test('Copy', () => {
    const source = { a: 1, 'a-b': 2, o: {} },
        copyObj = createCopy(source);

    console.log(copyObj.toString());

    expect(copyObj()).toEqual(source);
});
