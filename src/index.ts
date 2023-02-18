import { Middleware } from "@stricjs/core";
import { file } from "bun";
import { existsSync, statSync } from "fs";
import { stat } from "fs/promises";
import { join } from "path";

function isFile(path: string) {
    return statSync(path).isFile();
}

async function isFileAsync(path: string) {
    return (await stat(path)).isFile();
}

const urlSlicer = /(?:\w+:)?\/\/[^\/]+([^?]+)/;

/**
 * Serve a file
 * @param path The file or directory path 
 * @param options File loading options
 * @returns A middleware
 */
export function stream<T = any>(des: string, options?: BlobPropertyBag & ResponseInit): Middleware<T> {
    return isFile(des)
        ? () => existsSync(des) &&
            new Response(file(des, options), options)
        : async req => {
            const path = join(des, urlSlicer.exec(req.url)[1]);

            return existsSync(path) &&
                await isFileAsync(path) &&
                new Response(file(path, options), options);
        }
};

export * from "./response";
export * from "./cors";
export * from "./parser";
export * from "./csp";