import { readdirSync, statSync } from 'fs';
import { relative, join } from 'path';

export default function searchFiles(directory: string, dirname: string = directory) {
    let files: [relative: string, absolute: string][] = [],
        item: string, itemPath: string, fileStat: any;

    for (item of readdirSync(directory)) {
        itemPath = join(directory, item);
        fileStat = statSync(itemPath);

        if (fileStat.isDirectory())
            files.push(...searchFiles(itemPath, dirname));
        else if (fileStat.isFile())
            files.push(['/' + relative(dirname, itemPath), itemPath]);
    }

    return files;
}
