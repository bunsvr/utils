import { App } from "@stricjs/core";
import { stream } from "../..";

const app = new App();

// Serve the public directory
app.use(stream(import.meta.dir + "/public"));

// Serve using Bun
export default app;