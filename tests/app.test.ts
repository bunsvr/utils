import { App, routes, client } from '@stricjs/app';
import * as send from '@stricjs/app/send';
import { cors } from '..';
import { test, expect } from 'bun:test';

// A simple API routes
const api = routes()
    .plug(cors, send.plug)
    .get('/', ctx => ctx.body = 'Hi');

// Serve the routes
const tc = client(await App.serve(api));

// CORS test
test('CORS', async () => {
    const res = await tc.get('/');

    expect(await res.text()).toBe('Hi');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
});
