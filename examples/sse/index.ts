import { Router } from '@stricjs/router';
import { SSE, stream } from '../..';
import { sleep } from 'bun';

const sse = new SSE('/events')
    // Use a handler
    .use(async ({ signal }, res) => {
        while (!signal.aborted) {
            await res.write('data: Hi\n\n');
            await res.flush();
            await sleep(1000);
        }

        res.close();
    });

// Add to the router as a plugin
export default new Router()
    .get('/', stream(import.meta.dir + '/index.html'))
    .plug(sse).use(404);