export interface Fn<T = any, R = any> {
    (c: T): null | R;
}

type Unwrap<T> = T extends Promise<infer R> ? R : T;

function wrap(body: string, names: string[], values: Fn[]) {
    body = 'return x=>' + body;
    return Function(...names, body)(...values);
}

export class Func<T, R, I = T> {
    readonly list: any[] = [];

    constructor(fn: Fn<T, R>) {
        this.list.push(fn);
    }

    then<Y>(fn: Fn<Unwrap<R>, Y>): Func<Unwrap<R>, R extends Promise<any> ? Promise<Y> : Y, T> {
        this.list.push(fn);

        // @ts-ignore
        return this;
    }

    build(index = 0): Fn<I, R> {
        let body = '', names: string[] = [], values: Fn[] = [],
            name: string, last = this.list.at(-1),
            len_1 = this.list.length - 1;

        while (index < len_1) {
            name = 'f' + index;

            names.push(name);
            values.push(this.list[index]);

            if (this.list[index].constructor.name === 'AsyncFunction') {
                body += `${name}(x).then(_)`;

                names.push('_');
                values.push(this.build(index + 1));

                return wrap(body, names, values);
            }

            body += `${name}(x)===null?null:`;
            ++index;
        }

        name = 'f' + index;
        body += name + '(x)';

        names.push(name);
        values.push(last);

        return wrap(body, names, values);
    }
}
