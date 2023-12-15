export type BasicCredentials = [username: string, password: string];

export function extractBasic(header: string): BasicCredentials | null {
    if (header.startsWith('Basic ')) {
        // Need to decode base64
        header = atob(header);

        var sp = header.indexOf(':', 6);
        if (sp === -1) return null;

        return [
            header.substring(6, sp),
            header.substring(sp + 1)
        ];
    }

    return null;
}
