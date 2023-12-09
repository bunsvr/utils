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
}

cache.control = opts => opts ? builder.build(opts).join('') : defaultValue;

