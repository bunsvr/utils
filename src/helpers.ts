// ------- //
// Helpers //
// ------- //
const htmlResOpts: ResponseInit = {
    headers: { 'Content-Type': 'text/html' }
};

/**
 * Create an HTML response
 */
export function html(response: string) {
    return new Response(response, htmlResOpts);
};

/**
 * Compose an html function
 */
export function createHTML(options: ResponseInit): typeof html;

/**
 * Compose an html function with predefined body
 */
export function createHTML(options: ResponseInit, html: string): () => Response;
export function createHTML(options: ResponseInit, html?: string) {
    // TODO: Check whether <!DOCTYPE html is present in the html string so no need to include content type
    options.headers ||= {};
    Object.assign(options.headers, htmlResOpts);

    const staticHTMLExists = !!html, args = ['o'];
    if (staticHTMLExists) args.push('r');

    args.push(`return function(${staticHTMLExists ? '' : 'r'}){return new Response(r,o);}`);

    return Function(...args)(options, html);
}

/**
 * Create a response function
 */
export function response(serializable: any, options?: ResponseInit): () => Response {
    // Serialize the object (don't put buffer and other related streams and stuff here pls)
    if (serializable === Object(serializable)) {
        if (serializable.toString === Object.prototype.toString) {
            serializable = JSON.stringify(serializable);

            // Automatic response header
            options ||= {};
            options.headers ||= {};
            options.headers['Content-Type'] ||= 'application/json';
        } else serializable.toString();
    } else serializable = String(serializable);

    const optionsExists = !!options, args = ['d'];
    if (optionsExists) args.push('o');

    args.push(`return function(){return new Response(d${optionsExists ? ',o' : ''})}`);

    return Function(...args)(serializable, options);
}

export type BlobPart = string | Blob | BufferSource;
export type ResponseBody = ReadableStream<any> | BlobPart | BlobPart[] | FormData | URLSearchParams;

/**
 * Prepare response options for responding
 */
export function writeHead(options: ResponseInit) {
    return (body: ResponseBody) => new Response(body, options);
}
