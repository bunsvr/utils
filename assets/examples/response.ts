import { App } from "@stricjs/core";
import { response } from "../..";

const app = new App();

// Serve the public directory
app.use(async request => response({
    body: {
        url: request.url,
        headers: request.headers,
        method: request.method
    }
}));

// Serve using Bun
export default app;