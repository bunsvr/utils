export function extractBearer(header: string): string | null {
    return header.startsWith('Bearer ')
        ? header.substring(7) : null;
}

export function bearer(req: Request): string | null {
    let headerValue = req.headers.get('Authorization');
    if (headerValue === null) {
        headerValue = req.headers.get('Proxy-Authorization');
        if (headerValue === null) return null;
    }

    return extractBearer(headerValue);
}
