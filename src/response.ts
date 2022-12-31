function toBody(res: any): BodyInit {
    if (typeof res !== "object")
        return String(res);

    if (res instanceof ReadableStream
        || res instanceof Buffer
        || res instanceof ArrayBuffer
        || res instanceof Blob
        || res instanceof SharedArrayBuffer
        || ArrayBuffer.isView(res)
    )
        return res;

    if (Object.getPrototypeOf(res).toString === Object.prototype.toString)
        return JSON.stringify(res);

    return res.toString();
};

/**
 * Return a response with the corresponding response init
 * @param res The response object
 */
export function response<T = any>(res: T, init?: ResponseInit) {
    return new Response(toBody(res), init);
};