export function extractBearer(header: string): string | null {
    return header.startsWith('Bearer ')
        ? header.substring(7) : null;
}
