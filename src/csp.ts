import PropsBuilder from './internals/builder';

const sep = { kv: ' ', end: ';', multiValue: ' ' };

// Props that ends with 'src' goes here
const srcBuilder = new PropsBuilder<CSP.Source>()
    .put('default', 'default-src')
    .put('child', 'child-src')
    .put('connect', 'connect-src')
    .put('font', 'font-src')
    .put('img', 'img-src')
    .put('manifest', 'manifest-src')
    .put('media', 'media-src')
    .put('object', 'object-src')

    .put('script', 'script-src')
    .put('scriptAttr', 'script-src-attr')
    .put('scriptElem', 'script-src-elem')

    .put('style', 'style-src')
    .put('styleArr', 'style-src-attr')
    .put('styleElem', 'style-src-elem');

srcBuilder.separator = sep;

type SrcInfer = typeof srcBuilder.infer;

// Main builder
const builder = new PropsBuilder<CSP.Source>()
    .skip('src')
    .put<'sandbox', boolean | `allow-${'downloads' | 'forms' | 'modals' |
        'orientation-lock' | 'pointer-lock' |
        `popups${'' | '-to-escape-sandbox'}` |
        'presentation' | 'same-origin' |
        'scripts' | `top-navigation${'' | '-by-user-activation'
        | '-to-custom-protocols'
        }`}`>('sandbox')
    .put('formAction', 'form-action')
    .put('frameAncestors', 'frame-ancestors')
    .put('baseURI', 'base-uri')
    .put<'reportTo', string>('reportTo', 'report-to')

builder.separator = sep;

type OptionInfer = typeof builder.infer;

/**
 * Content security policy namespace
 */
export namespace CSP {
    /**
     * Sandbox value
     */
    export type SandboxValue = boolean | `allow-${'downloads' | 'forms' | 'modals' |
        'orientation-lock' | 'pointer-lock' | `popups${'' | '-to-escape-sandbox'}` |
        'presentation' | 'same-origin' | 'scripts' |
        `top-navigation${'' | '-by-user-activation' | '-to-custom-protocols'}`}`;

    /**
     * A single source
     */
    export type SourceValue =
        // Unsafe stuff
        | `unsafe-${'eval' | 'hashes' | 'inline'
        }`
        // Nonce or hash algorithm followed by base64 value
        | `${'nonce' | (string & {})}-${string}`
        // Normal constant values
        | 'strict-dynamic'
        | 'report-sample'
        | 'none'
        | 'self'
        | 'wasm-unsafe-eval'
        // Custom value
        | (string & {});

    /**
     * Single source or a list of sources
     */
    export type Source = SourceValue | SourceValue[];

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
