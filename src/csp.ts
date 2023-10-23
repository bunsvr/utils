function getHeader(value: CSP.OptionValue, name: string) {
    if (Array.isArray(value))
        value = value.join(" ");

    if (value)
        value = name + " " + value;
    else if (value !== false)
        value = name;

    return value + ";";
}

/**
 * Content security policy namespace
 */
export namespace CSP {
    /**
     * Directive src value
     */
    export type OptionValue = boolean | string | string[];

    /**
     * Fetch directive
     */
    export type FetchDirective = "child" | "connect" | "font" | "frame" | "img" | "manifest" | "media" | "object" | "prefetch" | "script" | "style" | "worker";

    /**
     * All directives 
     */
    export interface Options {
        /**
         * All options that started with src
         */
        readonly src?: {
            [key in FetchDirective]?: OptionValue;
        } & Dict<OptionValue>

        /**
         * Enables a sandbox for the requested resource
         */
        sandbox?: OptionValue;

        /**
         * Defines valid sources that can be used as an HTML `<form>` action.
         */
        form?: OptionValue;

        /**
         * Defines valid sources for embedding the resource using `<frame>`, `<object>`, `<embed>`.
         */
        frame?: OptionValue;

        /**
         * Defines valid MIME types for plugins invoked via <object> and <embed>.
         */
        plugin?: OptionValue;

        /**
         * Defines a set of allowed URLs which can be used in the `src` attribute of a HTML `base` tag.
         */
        uri?: OptionValue;

        /**
         * Report URI when policy violated
         */
        report?: OptionValue;

        /**
         * Restricts the URLs that the document may navigate to by any means.
         */
        navigate?: OptionValue;
    }

    /**
     * Parse CSP options into header value
     */
    export function parse(opts?: Options) {
        if (!opts)
            return "default-src 'self'";

        var headerValue = '';

        if (opts.src)
            for (const name in opts.src)
                headerValue += getHeader(opts.src[name], name + "-src");

        if (opts.sandbox)
            headerValue += getHeader(opts.sandbox, "sandbox");

        if (opts.form)
            headerValue += getHeader(opts.form, "form-action");

        if (opts.frame)
            headerValue += getHeader(opts.frame, "frame-ancestors");

        if (opts.plugin)
            headerValue += getHeader(opts.plugin, "plugin-types");

        if (opts.uri)
            headerValue += getHeader(opts.uri, "base-uri");

        if (opts.report)
            headerValue += `report-uri ${opts.report};report-to ${opts.report};`;

        if (opts.navigate)
            headerValue += getHeader(opts.navigate, "navigate-to");

        return headerValue.endsWith(';')
            ? headerValue.substring(0, headerValue.length - 1)
            : headerValue;
    }
}
