export function extractBearer(headerValue: string): string | null {
    if (headerValue.startsWith('Bearer '))
        return headerValue.substring(7);
    return null;
}

export function bearer(req: Request): string | null {
    let headerValue = req.headers.get('Authorization');
    if (headerValue === null) {
        headerValue = req.headers.get('Proxy-Authorization');
        if (headerValue === null) return null;
    }
    return extractBearer(headerValue);
}
