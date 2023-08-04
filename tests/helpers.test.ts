import { expect, test } from 'bun:test';
import { createHTML, html, response } from '..';

test('HTML', async () => {
    const staticHTML = '<p></p>';
    const customHTML = createHTML({}, staticHTML);

    expect(await customHTML().text()).toBe(staticHTML);
    expect(await html(staticHTML).text()).toBe(staticHTML);
});

test('Predefined response', async () => {
    const obj = {'a': 'b'}
    const objRes = response(obj);

    expect(await objRes().json()).toEqual(obj);
});
