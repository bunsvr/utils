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
export function file(des: string, options?: ResponseInit): Handler<any> {
    des = resolve(des);
    if (!statSync(des).isFile()) throw new Error('Path must be a file. For serving directory, use `dir()` with wildcard routes instead');

    return Function('g', 'o', `return function(){return new Response(g('${des}')${options ? ',o' : ''})}`)(getfile, options);
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

    let pair: [relative: string, absolute: string];
    for (pair of searchFiles(dir))
        group.get(pair[0], file(pair[1], options));

    return group;
}

/**
 * Serve a directory.
 *
 * This function should be used with `@stricjs/router` wildcard routes
 */
export function dir(des: string, options?: StreamOptions): Handler<any> {
    des = resolve(des);
    if (!statSync(des).isDirectory()) throw new Error('Path must be a directory');

    if (des.at(-1) != '/') des += '/';

    des = `const f=a('${des}'+c.params['*']);return f.exists().then`
        + `(function(_){return _?new Response(f${options ? ',b' : ''}):null})`;

    return Function('a', 'b', `return function(c){${des}}`)(getfile, options);
}
