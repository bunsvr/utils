import { file } from 'bun';
import { Handler, Group } from '@stricjs/router';
import { statSync } from 'fs';
import { resolve } from 'path';
import searchFiles from './searchFiles';

declare global {
    interface Request {
        /**
         * The parsed pathname without the query
         */
        readonly path: string;
    }
}

/**
 * Options for streaming files and dirs
 */
export interface StreamOptions extends ResponseInit {
    /**
     * WHether to parse path or not
     */
    doParsePath?: boolean;

    /**
     * Does not found handling or not
     */ 
    handleNotFound?: boolean

    /**
     * Specify the root (plugins only)
     */
    root?: string;
}

/**
 * Serve a file 
 * @param path The file or directory path 
 * @param options File loading options
 * @returns A middleware
 */
export function stream(des: string, options?: StreamOptions): Handler {
    des = resolve(des);
    const isFile =statSync(des).isFile();
    if (!isFile && !des.endsWith('/')) des += '/';

    const { doParsePath = true, handleNotFound = true, ...rest } = options || {};
    options = rest;
    if (Object.keys(options).length === 0) options = null;

    return isFile
        ? () => new Response(file(des), options)
        : new Function('f', 'd', 'o', `${handleNotFound ? 'const h={status:404};' : ''}return async function(r){${doParsePath 
            ? "const s=r.url.indexOf('/',12)+1," 
                + "e=r.url.indexOf('?',s);" 
                + "r.path=e===-1?r.url.substring(s):r.url.substring(s,e);" 
            : ''
        }const q=f(d+r.path);return await q.exists()?new Response(q${
            options === null ? '' : ',o'
        }):${handleNotFound ? 'new Response(null,h)' : 'null'};}`)(file, des, options)
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
        group.get(relative, 
            () => new Response(
                file(absolute), 
                options
        ));
    
    return group;
}

/**
 * Wrap the handler in a direct readable stream
 */
export function writer<T extends string>(h: Handler<T>): Handler<T> {
    return Function('d', `const type='direct';return function(...a){return new Response(new ReadableStream({type,pull(c){a[0].controller=c;d(...a)}}))}`)(h);
}
