export * from './files';

export namespace stream {
    export type Data = string | BufferSource;

    /**
     * Create a direct ReadableStream based on an async iterator
     */
    export declare function it<T extends Data>(
        it: AsyncIterable<T>,
        cancel?: UnderlyingSourceCancelCallback
    ): ReadableStream;

    /**
     * Create a direct readable stream
     */
    export declare function direct(
        pull: DirectUnderlyingSource['pull']
    ): ReadableStream;
}

// Arrow functions are faster
stream.it = it => new ReadableStream({
    type: 'direct',
    pull: async c => {
        try {
            var t: any;
            for await (t of it) c.write(t);
            c.end();
        } catch (e) {
            c.close(e);
        }
    }
});

stream.direct = pull => new ReadableStream({
    type: 'direct', pull
});

