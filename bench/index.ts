import { run, bench, group } from 'mitata';
import { cookie, EmptyObject, qs } from '..';

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
const str = 'a= b;  b=c ;  c=d ; p=d  ;  averylongkey=alongvalueas well ;'
    + 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaa =bbbbbbbbbbbbbbbbbbbb bbbbb; c';

// Parse cookie using split
function split(str: string) {
    var o = new EmptyObject, t: string, sp: string[];

    for (t of str.split(';')) {
        sp = t.split('=');

        if (sp.length === 2)
            o[sp[0].trim()] = sp[1].trim();
        else
            o[sp[0].trim()] = true;
    }

    return o;
};

// Check whether results matched first
const resSplit = split(str), resCookie = cookie(str);
console.log(resCookie, resSplit);

for (const o in resSplit)
    if (resSplit[o] !== resCookie[o])
        throw new Error('Invalid implementation!');

// Main bench
group('Cookie', () => {
    bench('Split', () => split(str));
    bench('Stric cookie', () => cookie(str));
});

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

run();
