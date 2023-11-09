import { statSync } from 'fs';
import { resolve } from 'path';

export type CommonExtension = '.html' | '.htm' | '.xhtml' | '.pdf' | '.xml' | '.json' | (string & {});

export interface StreamOptions extends ResponseInit {
    root?: string,
    /**
     * Extensions for shorthand like `/a.html` -> `/a`.
     * Specified extensions should start with `.`.
     */
    extensions?: CommonExtension[];
    /**
     * Choose the mode to select the file
     */
    select?: 'all' | 'extensions' | RegExp;
}

/**
 * Serve a file 
 * @param path The file or directory path 
 * @param options File loading options
 * @returns A middleware
 */
export function file(des: string, options?: ResponseInit): () => Response {
    des = resolve(des);
    if (!statSync(des).isFile()) throw new Error('Path must be a file. For serving directory, use `dir()` with wildcard routes instead');

    return Function('g', 'o', `return ()=>new Response(g(\`${des}\`)${options ? ',o' : ''})`)(globalThis.Bun.file, options);
};

/**
 * Serve a directory.
 *
 * This function should be used with wildcard routes
 */
export function dir(des: string, options?: StreamOptions): () => Promise<Response | null> {
    des = resolve(des);
    if (!statSync(des).isDirectory()) throw new Error('Path must be a directory');

    if (des.at(-1) != '/') des += '/';

    des = `const f=a('${des}'+c.params['*']);return await f.exists()`
        + `?new Response(f${options ? ',b' : ''}):null`;

    return Function('a', 'b', `return async c=>{${des}}`)(globalThis.Bun.file, options);
}
