export type BasicCredentials = [username: string, password: string];

export function extractBasic(header: string): BasicCredentials | null {
    if (header.startsWith('Basic ')) {
        var sp = header.indexOf(':', 6);
        if (sp === -1) return null;

        return [
            header.substring(6, sp),
            header.substring(sp + 1)
        ];
    }

    return null;
}

export function basic(req: Request): BasicCredentials | null {
    var str = req.headers.get('Authorization');
    if (str === null) {
        str = req.headers.get('Proxy-Authorization');
        if (str === null) return null;
    }

    return extractBasic(str);
}
