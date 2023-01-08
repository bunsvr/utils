/**
 * Content security policy namespace
 */
export namespace CSP {
    /**
     * Directive src value
     */
    export type SrcValue = boolean | string | string[];

    /**
     * Fetch directive
     */
    export type FetchDirective = "child" | "connect" | "font" | "frame" | "img" | "manifest" | "media" | "object" | "prefetch" | "script" | "style" | "worker" | "sandbox";

    /**
     * All directives 
     */
    export interface Options {
        readonly src: {
            [key in FetchDirective]?: SrcValue;
        } & {
            [key: string]: SrcValue;
        }

        report?: string;
    }

    /**
     * Parse CSP options into header value
     */
    export function parse(opts?: Options) {
        if (!opts)
            return "default-src 'self'";

        let headerValue = "", value: SrcValue;
        const reportURI = opts.report;

        for (const name in opts.src) {
            value = opts.src[name];

            if (Array.isArray(value))
                value = value.join(" ");

            if (value)
                headerValue += name + " " + value;
            else if (value !== false)
                headerValue += name;

            headerValue += "; ";
        }

        if (reportURI)
            headerValue += `; report-uri ${reportURI}; report-to ${reportURI}`;

        return headerValue;
    }
}
