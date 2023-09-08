import { Handler, Group } from '@stricjs/router';
import { statSync } from 'fs';
import { resolve } from 'path';
import searchFiles from './searchFiles';

export interface StreamOptions extends ResponseInit {
    doParsePath?: boolean,
    root?: string,
}

const getfile = globalThis.Bun?.file;

/**
 * Serve a file 
 * @param path The file or directory path 
 * @param options File loading options
 * @returns A middleware
 */
export function file(des: string, options?: ResponseInit): Handler {
    des = resolve(des);
    if (!statSync(des).isFile()) throw new Error('Path must be a file. For serving directory, use `dir()` with wildcard routes instead');

    return () => new Response(getfile(des), options);
};

/**
 * Map all files into route handlers
 * @param dir 
 * @param options 
 */
export function group(dir: string, options?: StreamOptions) {
    dir = resolve(dir);
    if (!dir.endsWith('/')) dir += '/';

    const { doParsePath = true, root = '/', ...rest } = options || {};
    options = rest;

    const group = new Group(root);
    for (const [relative, absolute] of searchFiles(dir))
        group.get(relative, () => new Response(getfile(absolute), options));

    return group;
}

/**
 * Serve a directory.
 *
 * This function should be used with `@stricjs/router` wildcard routes
 */
export function dir(des: string, options?: StreamOptions): Handler<string> {
    des = resolve(des);
    if (!statSync(des).isDirectory()) throw new Error('Path must be a directory');

    if (des.at(-1) != '/') des += '/';

    return async ctx => {
        const f = getfile(des + (ctx.params as any)['*']);
        return await f.exists() ? new Response(f, options) : null;
    }
}
