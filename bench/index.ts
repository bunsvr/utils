import { run, bench, group } from 'mitata';
import { qs } from '..';

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

group('Distinguish String & Arrays', () => {
    const a = 'str', b = ['a'], at = String.prototype.at;
    bench('Prototype check', () => a.at === at && b.at === at);

    // @ts-ignore
    bench('Chain check', () => a.pop && b.pop);
});

group('Query', () => {
    const a = 'a=b&b=c&c=d&y=xn2iqvn2qnbiq&u=t2';

    bench('Native', () => {
        const params = new URLSearchParams(a);

        return params.get('a') as string + params.get('b') as string
            + params.get('c') as string + params.get('d') as string
    });
    bench('Stric', () => {
        const params = qs.parse(a);
        return params.a as string + params.b as string
            + params.c as string + params.y as string;
    });
});

group('Foreach', () => {
    const a = 'a b cd ef gh idk uuuuuuuuuuuuuuuuuuuuuuuu ajanba nan ';

    bench('No cache', () => {
        let b: string;
        for (b of a.split(' '));
    });

    bench('Cached', () => {
        let b: string, c = a.split(' ');
        for (b of c);
    });
});

group('Hash', () => {
    const seed = performance.timeOrigin,
        str = 'arandomstringthatisreallylong';

    bench('No seed', () => Bun.hash(str));
    bench('With seed', () => Bun.hash(str, seed));
});

run();
