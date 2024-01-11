import { resolve } from 'path';
import { statSync } from 'fs';
import escapeStr from './internals/escapeStr';

export namespace stream {
    export type Data = string | BufferSource;

    /**
     * Create a direct ReadableStream based on an async iterable object
     */
    export function iterable<T extends Data>(
        it: AsyncIterable<T>,
        cancel?: UnderlyingSourceCancelCallback
    ): ReadableStream {
        return new ReadableStream({
            type: 'direct',
            pull: async c => {
                try {
                    let t: any;
                    for await (t of it) c.write(t);
                    c.end();
                } catch (e) {
                    c.close(e);
                }
            },
            cancel
        });
    };

    /**
     * Create a direct readable stream
     */
    export function direct(pull: DirectUnderlyingSource['pull']): ReadableStream {
        return new ReadableStream({
            type: 'direct', pull
        });
    };

    /**
     * Stream a file 
     * @param path The file or directory path 
     * @param options File loading options
     * @returns A middleware
     */
    export function file(des: string, options?: ResponseInit): () => Response {
        des = resolve(des);
        if (!statSync(des).isFile()) throw new Error('Path must be a file. For serving directory, use `dir()` with wildcard routes instead');

        return Function('g', 'o', `return ()=>new Response(g('${escapeStr(des)}')${options ? ',o' : ''})`)(globalThis.Bun.file, options);
    };

    /**
     * Serve a directory.
     *
     * This function should be used with wildcard routes
     */
    export function dir(des: string, options?: ResponseInit): (c: { params: { '*': string } }) => Promise<Response | null> {
        des = resolve(des);
        if (!statSync(des).isDirectory()) throw new Error('Path must be a directory');

        if (des.at(-1) != '/') des += '/';

        des = `const f=a('${escapeStr(des)}'+c.params['*']);return await f.exists()`
            + `?new Response(f${options ? ',b' : ''}):null`;

        return Function('a', 'b', `return async c=>{${des}}`)(globalThis.Bun.file, options);
    }
}
