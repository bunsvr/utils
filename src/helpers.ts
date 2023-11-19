const htmlOpts: ResponseInit = {
    headers: { 'Content-Type': 'text/html' }
};

/**
 * Compose an html function
 */
export function createHTML(options: ResponseInit): (html: string) => Response;

/**
 * Compose an html function with predefined body
 */
export function createHTML(options: ResponseInit, html: string): () => Response;
export function createHTML(options: ResponseInit, html?: string) {
    options.headers ||= {};
    Object.assign(options.headers, htmlOpts);

    const staticHTMLExists = !!html, args = ['o'];
    if (staticHTMLExists) args.push('r');

    args.push(`return ${staticHTMLExists ? '()' : 'r'}=>new Response(r,o)`);

    return Function(...args)(options, html);
}

/**
 * Create a response function
 */
export function response(serializable: any, options?: ResponseInit): () => Response {
    const optionsExists = !!options,
        isObj = serializable && typeof serializable === 'object';

    if (serializable === undefined || serializable === null) serializable = null;
    // Serialize the object (don't put buffer and other related streams and stuff here pls)
    else if (isObj) {
        if (serializable.toString === Object.prototype.toString) {
            serializable = JSON.stringify(serializable);

            // Automatic response header
            options ||= {};
            options.headers ||= {};
            options.headers['Content-Type'] ||= 'application/json';
        } else serializable.toString();
    } else serializable = `'${serializable}'`;

    const args = [], values = [];
    if (isObj) {
        args.push('d');
        values.push(serializable);
    }

    if (optionsExists) {
        args.push('o');
        values.push(options);
    }

    args.push(`return ()=>new Response(${isObj ? 'd' : serializable}${optionsExists ? ',o' : ''})`);
    return Function(...args)(...values);
}

export type BlobPart = string | Blob | BufferSource;
export type ResponseBody = ReadableStream<any> | BlobPart | BlobPart[] | FormData | URLSearchParams;

/**
 * Prepare response options for responding
 */
export const writeHead = (options: ResponseInit) => (body: ResponseBody) => new Response(body, options);

/**
 * Left pad. This does not validate input so it can run 
 * into an infinite loop if `cnt` is smaller than `0`
 *
 * This is the left pad algorithm by Travvy
 */
export const leftPad = (str: string, cnt: number, literal: string): string => {
    let p = '';
    while (true) {
        if ((cnt & 1) === 1) p += literal;
        cnt >>= 1;

        if (cnt === 0) return p + str;
        literal += literal;
    }
}

/**
 * Extend an object. Faster than spread and `Object.assign`
 */
export const extend = (target: any, source: any): void => {
    var k: any;
    for (k in source) target[k] = source[k];
}

/**
 * Create a null prototype object and assign keys of a and b to that object
 */
export const extendClone = <A, B>(a: A, b: B): A & B => {
    var o = new EmptyObject, k: any;
    for (k in a) o[k] = a[k];
    for (k in b) o[k] = b[k];
    return o;
}

export const isVariable = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;

/**
 * Internal API to create an extend function body based on an object
 */
export function createExtendFunction(b: any, sourceName: string, targetName: string): string {
    let fn = '', key: string, value: any;

    for (key in b) {
        value = b[key];
        if (value === undefined) continue;

        key = isVariable.test(key) ? '.' + key : `['${key}']`;
        fn += targetName + key + '=';

        if (typeof value !== 'object' && typeof value !== 'function') {
            if (typeof value === 'string') fn += `'${value}'`;
            else fn += String(value);
        } else fn += sourceName + key;

        fn += ';';
    }

    return fn;
}

/**
 * Create an extend function for an object.
 * This optimization only works with object that has string keys
 */
export function createExtend(b: any): (a: any) => void {
    return Function('b', `return a=>{${createExtendFunction(b, 'b', 'a')}}`)(b);
}

/**
 * Return a function to create a copy of an object
 */
export const createCopy = <T>(o: T): (() => T) => Function(`return ()=>(${JSON.stringify(o)})`)();

/**
 * Create a null prototype object
 */
export function EmptyObject() { };
EmptyObject.prototype = Object.create(null);
