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
    if (des.endsWith('/')) des = des.slice(0, -1);

    const { doParsePath = true, ...rest } = options || {};
    options = rest;

    return statSync(des).isFile()
        ? () => new Response(file(des), options)
        : async r => {
            // Parse path
            if (doParsePath) {
                const u = r.url, s = u.indexOf('/', 12), e = u.indexOf('?', s + 1);
                // @ts-ignore
                if (e === -1) r.path = u.substring(s);
                // @ts-ignore
                else r.path = u.substring(s, e);
            }

            const f = file(des + r.path);
            if (await f.exists())
                return new Response(f, options);
        }
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
export function writer(h: (req: Request, res: ReadableStreamDirectController) => any) {
    return Function('d', `const type='direct';return function(r){return new Response(new ReadableStream({type,pull(c){d(r,c)}}))}`)(h);
}
