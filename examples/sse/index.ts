import { Router } from '@stricjs/router';
import { SSE, stream } from '../..';
import { sleep } from 'bun';

const sse = new SSE('/events')
    // Use a handler
    .use(async req => {
        await req.controller.write('data: Hi\n\n');
        await req.controller.flush();
        await sleep(1000);
    });

// Add to the router as a plugin
export default new Router()
    .get('/', stream(import.meta.dir + '/index.html'))
    .plug(sse).use(404);
