export interface Fn<T = any, R = any> {
    (c: T): null | R;
}

export class Func<T, R, I = T> {
    readonly list: any[] = [];

    constructor(fn: Fn<T, R>) {
        this.list.push(fn);
    }

    then<Y>(fn: Fn<R, Y>): Func<R, Y, T> {
        this.list.push(fn);

        // @ts-ignore
        return this;
    }

    build(): Fn<I, R> {
        let body = '', names: string[] = [], values: Fn[] = [],
            index = 0, name: string, last = this.list.pop();

        while (index < this.list.length) {
            name = 'f' + index;
            body += `${name}(x)===null?null:`;

            names.push(name);
            values.push(this.list[index]);

            ++index;
        }

        name = 'f' + index;
        body += name + '(x)';

        names.push(name);
        values.push(last);

        body = `return x=>` + body;
        return Function(...names, body)(...values);
    }
}
