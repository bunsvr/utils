import PropsBuilder from './internals/builder';

const sep = { kv: ' ', end: ';' };

// Props that ends with 'src' goes here
const srcBuilder = new PropsBuilder<CSP.OptionValue>().reg(
    'child', 'connect', 'font', 'iframe', 'img',
    'manifest', 'media', 'object', 'prefetch',
    'script', 'style', 'worker', 'default'
);
srcBuilder.suffix = '-src';
srcBuilder.separator = sep;

type SrcInfer = typeof srcBuilder.infer;

// Main builder
const builder = new PropsBuilder<CSP.OptionValue>()
    .skip('src')
    .put('sandbox')
    .put('formAction', 'form-action')
    .put('frameAncestors', 'frame-ancestors')
    .put('pluginTypes', 'plugin-types')
    .put('baseURI', 'base-uri')
    .put('reportTo', 'report-to')
    .put('navigateTo', 'navigate-to');
builder.separator = sep;

type OptionInfer = typeof builder.infer;

/**
 * Content security policy namespace
 */
export namespace CSP {
    /**
     * Directive src value
     */
    export type OptionValue = boolean | string | string[];

    /**
     * All directives 
     */
    export interface Options extends OptionInfer {
        /**
         * All source directives
         */
        src: SrcInfer;
    }

    /**
     * Parse CSP options into header value
     */
    export function parse(opts?: Options) {
        if (!opts)
            return "default-src 'self'";

        const parts = builder.build(opts);
        srcBuilder.build(opts.src, parts);

        return parts.join('');
    }
}
