import { readdirSync, statSync } from 'fs';
import { relative, join } from 'path';

export default function searchFiles(directory: string, dirname: string = directory) {
    let files: [relative: string, absolute: string][] = [], item: string;

    for (item of readdirSync(directory)) {
        const itemPath = join(directory, item);
        const fileStat = statSync(itemPath);

        if (fileStat.isDirectory())
            files.push(...searchFiles(itemPath, dirname));
        else if (fileStat.isFile())
            files.push(['/' + relative(dirname, itemPath), itemPath]);
    }

    return files;
}
