import { Router } from '@stricjs/router';
import { buchta } from '../..';

const app = new Router().plug(await buchta());

export default app;
