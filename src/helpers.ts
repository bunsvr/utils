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
 * Compose another `html` function with custom response options
 */
export function createHTML(options: ResponseInit): typeof html {
    options.headers ||= {};
    Object.assign(options.headers, htmlResOpts);

    return Function('o', 'return function(r){return new Response(r,o);}')(options);
}
