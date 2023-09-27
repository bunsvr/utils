import { expect, test } from 'bun:test';
import {
    createCopy, createExtend, createHead, createHTML, writeHead,
    extend, html, leftPad, response
} from '..';

test('HTML', async () => {
    const staticHTML = '<p></p>';
    const customHTML = createHTML({}, staticHTML);

    expect(await customHTML().text()).toBe(staticHTML);
    expect(await html(staticHTML).text()).toBe(staticHTML);
});

test('Predefined response', async () => {
    let obj = { 'a': 'b' }, objRes: (...args: any[]) => Response = response(obj, {
        headers: { 'Content-Type': 'application/json' }, status: 404
    });

    expect(await objRes().json()).toEqual(obj);

    objRes = createHead({ status: 404, headers: { 'Content-Type': 'text/plain' } });
    console.log(objRes.toString());

    expect(objRes('Hi', {}).headers.get('Content-Type')).toBe('text/plain');

    objRes = writeHead({ status: 404 });
    expect(objRes('Hi').status).toBe(404);
});

test('Left pad', () => {
    expect(leftPad('str', 2, ' ')).toBe('  str');
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
