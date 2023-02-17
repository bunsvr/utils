const path = /(?:\w+:)?\/\/[^\/]+([^?]+)/;
const query = /\?(.*)/;
const scheme = /^([a-z]+):\/\//;
const hostname = /^[a-z]+:\/\/([^\/:]+)/;
const port = /^[a-z]+:\/\/[^\/:]+:(\d+)/;
const host = /^[a-z]+:\/\/([^\/]+)/;
const hash = /#([^#]+)/;

export class URLParser {
    /**
     * Current URL
     */
    url: string;

    /**
     * Create an URL parser
     */
    constructor() {}

    /**
     * Update the URL to parse
     * @param url 
     */
    update(url: string) {
        this.url = url;

        return this;
    }

    /**
     * Get path from URL
     */
    get path() {
        return path.exec(this.url)?.[1];
    }

    /**
     * Get query from URL
     */
    get query() {
        return query.exec(this.url)?.[1];
    }

    /**
     * Get the scheme of an URL
     */
    get scheme() {
        return scheme.exec(this.url)?.[1];
    }

    /**
     * Return the host without the port
     */
    get hostname() {
        return hostname.exec(this.url)?.[1];
    }

    /**
     * Return the port
     */
    get port() {
        const val = port.exec(this.url)?.[1];
        return val && Number(val);
    }

    /**
     * Return the host with the port
     */
    get host() {
        return host.exec(this.url)?.[1];
    }

    /**
     * Get hash from URL
     */
    get hash() {
        return hash.exec(this.url)?.[1];
    }

    /**
     * Get path from URL
     * @param url 
     */
    static path(url: string) {
        return path.exec(url)?.[1];
    }

    /**
     * Get query from URL
     * @param url 
     */
    static query(url: string) {
        return query.exec(url)?.[1];
    }

    /**
     * Get the scheme of an URL
     * @param url 
     */
    static scheme(url: string) {
        return scheme.exec(url)?.[1];
    }

    /**
     * Return the host without the port
     * @param url 
     */
    static hostname(url: string) {
        return hostname.exec(url)?.[1];
    }

    /**
     * Return the port
     * @param url 
     */
    static port(url: string) {
        const val = port.exec(url)?.[1];
        return val && Number(val);
    }

    /**
     * Return the host with the port
     * @param url 
     */
    static host(url: string) {
        return host.exec(url)?.[1];
    }

    /**
     * Get hash from URLs
     * @param url 
     */
    static hash(url: string) {
        return hash.exec(url)?.[1];
    }
}