import PropsBuilder from './internals/builder';

const defaultValue = 'public,max-age=604800';

// Builder setup
const builder = new PropsBuilder<boolean>()
    .put<'maxAge', number>('maxAge', 'max-age')
    .put<'smaxAge', number>('smaxAge', 's-maxage')
    .put('noCache', 'no-cache')
    .put('mustRevalidate', 'must-revalidate')
    .put('proxyRevalidate', 'proxy-revalidate')
    .put('mustUnderstand', 'must-understand')
    .put('noTransform', 'no-transform')
    .put('staleWhileRevalidate', 'stale-while-revalidate')
    .put('staleIfError', 'stale-if-error')
    .reg('private', 'public', 'immutable');

builder.separator = { kv: '=', end: ',', multiValue: ' ' };

type ControlOptionsInfer = typeof builder.infer;

export namespace cache {
    /**
     * Cache control options
     */
    export interface ControlOptions extends ControlOptionsInfer { };

    /**
     * Build cache control header value
     */
    export declare function control(opts?: ControlOptions): string;

    /**
     * Create an ETag of a resource
     */
    export declare function tag(data: string | TypedArray | DataView | ArrayBuffer | SharedArrayBuffer): number | bigint;
}

cache.control = opts => opts ? builder.build(opts).join('') : defaultValue;

// Basically ETag hashing 
{
    const hash = globalThis.Bun?.hash;

    if (hash) {
        const seed = performance.timeOrigin;
        cache.tag = d => hash(d, seed);
    } else cache.tag = null;
}
