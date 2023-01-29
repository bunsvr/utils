import { Middleware, App as CoreApp } from "@stricjs/core";
import { file } from "bun";

/**
 * Serve a file
 * @param path The file path or descriptor
 * @param options File loading options
 * @returns A middleware
 */
export function stream<App extends CoreApp, RequestData = any>(des: any, options?: BlobPropertyBag): Middleware<App, RequestData> {
    return () => new Response(file(des, options));
};

export * from "./response";
export * from "./cors";
export * from "./csp";