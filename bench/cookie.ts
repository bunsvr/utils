import { run, bench, group } from 'mitata';
import { cookie, EmptyObject } from '..';

// JIT bias
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });

// Main stuff goes here
const str = 'a=b;b=c;c=d;p';

// Parse cookie using split
function split(str: string) {
    var o = new EmptyObject, t: string, sp: string[];

    for (t of str.split(';')) {
        sp = t.split('=');

        if (sp.length === 2)
            o[sp[0].trim()] = sp[1].trim();
    }

    return o;
};

// Main bench
group('Main', () => {
    bench('Split', () => split(str));
    bench('Stric cookie', () => cookie(str));
});

run();
