export type BasicCredentials = [username: string, password: string];

export function extractBasic(headerVal: string): BasicCredentials | null {
    if (headerVal.indexOf('Basic ') === 0) {
        const credentials = headerVal.substring(6), splitter = credentials.indexOf(':');
        if (splitter === -1) return null;
        return [credentials.substring(0, splitter), credentials.substring(splitter + 1)];
    }
    return null;
}

export function basic(req: Request): BasicCredentials | null {
    let headerValue = req.headers.get('Authorization');
    if (headerValue === null) {
        headerValue = req.headers.get('Proxy-Authorization');
        if (headerValue === null) return null;
    }
    return extractBasic(headerValue);
}
