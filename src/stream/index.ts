import { Handler, Group } from '@stricjs/router';
import { statSync } from 'fs';
import { resolve } from 'path';
import searchFiles from './searchFiles';

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
export function file(des: string, options?: ResponseInit): Handler<any> {
    des = resolve(des);
    if (!statSync(des).isFile()) throw new Error('Path must be a file. For serving directory, use `dir()` with wildcard routes instead');

    return Function('g', 'o', `return ()=>new Response(g(\`${des}\`)${options ? ',o' : ''})`)(globalThis.Bun.file, options);
};

/**
 * Map all files into route handlers
 * @param dir 
 * @param options 
 */
export function group(dir: string, options?: StreamOptions) {
    dir = resolve(dir);
    if (!dir.endsWith('/')) dir += '/';

    const { root = '/', extensions = ['.html'], select = 'all', ...rest } = options || {};
    options = rest;

    const group = new Group(root),
        selectExtension = select === 'extensions',
        isRegex = select instanceof RegExp;

    let pair: [relative: string, absolute: string],
        relativ: string, handler: Handler, ext: string,
        shortPath: string, hasExt: boolean;

    for (pair of searchFiles(dir)) {
        // Skip if the file path does not match the extension
        if (isRegex && !select.test(pair[1])) continue;

        hasExt = false;
        relativ = pair[0];
        handler = file(pair[1], options);

        // File system routing with Stric router
        for (ext of extensions)
            if (relativ.endsWith(ext)) {
                hasExt = true;

                // Normal shorthand handler
                shortPath = relativ.substring(0, relativ.length - ext.length);
                group.all(shortPath, handler);

                // Index to /
                if (shortPath.endsWith('index'))
                    group.all(shortPath.substring(0, shortPath.length - 5), handler);
            }

        // Select extension
        if (selectExtension) {
            if (!hasExt) continue;
        } else
            // Normal handler 
            group.all(pair[0], handler);
    }

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
        + `(_=>_?new Response(f${options ? ',b' : ''}):null)`;

    return Function('a', 'b', `return c=>{${des}}`)(globalThis.Bun.file, options);
}
