import { expect, test } from 'bun:test';
import {
    createCopy, createExtend, createHTML, extend, html, leftPad
} from '..';

test('HTML', async () => {
    const staticHTML = '<p></p>';
    const customHTML = createHTML({}, staticHTML);

    expect(await customHTML().text()).toBe(staticHTML);
});

test('Left pad', () => {
    expect(leftPad('str', 2, ' ')).toBe('  str');
});

test('Extend', () => {
    const a = { a: 1 };
    extend(a, { b: 2 });
    expect(a as any).toEqual({
        a: 1, b: 2
    });
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

test('HTML', () => {
    expect(html`<p>${0}</p>`).toBe('<p>0</p>');
});
