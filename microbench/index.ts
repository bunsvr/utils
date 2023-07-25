/// <reference types='bun-types' />
import { run, bench } from 'mitata';

const v = {}, o = 'object';
bench('v === Object(v)', () => v === Object(v));
bench('typeof', () => typeof v === o)

run();
