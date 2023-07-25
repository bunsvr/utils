import { Handler, Router, Params } from "@stricjs/router";

declare global {
    interface Request {
        /**
         * The readable stream controller of the request
         */
        controller: ReadableStreamDirectController
    }
}

interface SSEHandler<T extends string = string> {
    /**
     * @param request The current request
     */
    (request: Request<Params<T>>): any | Promise<any>;
}

/**
 * Handle SSE
 */
export class SSE<T extends string = any> {
    constructor(public path: T, public options: ResponseInit = {}) { }
    handler: SSEHandler<T>;
    abortHandler: SSEHandler<T>;

    /**
     * Use this as a router plugin
     * @param app 
     */
    plugin(app: Router) {
        app.get(this.path, createHandler(this));
    }

    /**
     * Register a handler to send events
     * @param handler 
     */
    use(handler: SSEHandler<T>) {
        this.handler = handler;
        return this;
    }

    /**
     * Specify an abort handler
     */
    abort(handler: SSEHandler<T>) {
        this.abortHandler = handler;
        return this;
    }
}

function isAsync(func: any) {
  return func.constructor.name === 'AsyncFunction';
}

function createHandler(sse: SSE) {
    const isHandlerAsync = isAsync(sse.handler),
        abortHandlerExists = !!sse.abortHandler;
    const abortStatement = abortHandlerExists ? 'q(r)' : 'c.close()';

    // s: signal,
    // r: request
    // c: controller
    // a: The SSE object to compose
    // d: Response headers and stuff
    // v: 'Accept'
    // s: signal
    // q: abort handler
    // t: content type
    return Function('a', `const d={headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'}},type='direct',v='Accept',h=a.handler,t='text/event-stream'${abortHandlerExists ? ',q=a.abortHandler' : ''};Object.assign(d,a.options);return function(r){if(r.headers.get(v)===t)return new Response(new ReadableStream({type,${isHandlerAsync ? 'async ' : ''}pull(c){r.controller=c;const s=r.signal;while(!s.aborted)${isHandlerAsync ? 'await ' : ''}h(r);${abortStatement};}}),d);}`)(sse) as Handler;
}

