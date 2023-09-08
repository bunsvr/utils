import { Handler, Router } from "@stricjs/router";

declare global {
    interface Request {
        /**
         * The readable stream controller of the request
         */
        controller: ReadableStreamDirectController
    }
}

/**
 * Handle SSE
 */
export class SSE<T extends string = any> {
    constructor(public path: T, public options: ResponseInit = {}) { }
    handler: Handler<T>;
    abortHandler: Handler<T>;
    hasStore: boolean = false;

    /**
     * Use this as a router plugin
     * @param app 
     */
    plugin(app: Router) {
        // @ts-ignore internal store
        if (app.storage) this.hasStore = true;
        app.get(this.path, createHandler(this));
    }

    /**
     * Register a handler to send events
     * @param handler 
     */
    use(handler: Handler<T>) {
        this.handler = handler;
        return this;
    }

    /**
     * Specify an abort handler
     */
    abort(handler: Handler<T>) {
        this.abortHandler = handler;
        return this;
    }
}

function isAsync(func: any) {
    return func.constructor.name === 'AsyncFunction';
}

const defaultOpts = {
    headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    }
};

function createHandler(sse: SSE): Handler {
    const args = 'r' + (sse.hasStore ? ',o' : '');
    const isHandlerAsync = isAsync(sse.handler),
        abortHandlerExists = !!sse.abortHandler;
    const abortStatement = abortHandlerExists ? `q(${args})` : 'c.close()';

    // Fix missing options
    sse.options ||= {};
    Object.assign(sse.options.headers, defaultOpts.headers);

    // s: signal,
    // r: request
    // c: controller
    // a: The SSE object to compose
    // d: Response headers and stuff
    // v: 'Accept'
    // s: signal
    // q: abort handler
    // t: content type
    return Function('a', `${abortHandlerExists ? 'const q=a.abortHandler' : ''}`
        + `Object.assign(d,a.options);` + `return function(${args}){if(r.headers.get('Accept')==='text/event-stream')`
        + `return new Response(new ReadableStream({type:'direct',${isHandlerAsync ? 'async ' : ''}pull(c)`
        + `{r.controller=c;while(!r.signal.aborted)${isHandlerAsync ? 'await ' : ''}h(${args});${abortStatement};}}),d);}`)(sse);
}

