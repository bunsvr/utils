/// <reference types='bun-types' />
import { bench, run } from 'mitata';

const x = Math.random() ? '' : (Math.random() ? true : (Math.random() ? 0 : {})), num = 'number', str = 'string', bool = 'boolean';
bench('Number check typeof', () => typeof x === num);
bench('Number check ref', () => x === Number(x));
bench('String check typeof', () => typeof x === str);
bench('String check ref', () => x === String(x));

run();
