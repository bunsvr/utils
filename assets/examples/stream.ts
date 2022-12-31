import { App } from "@bunsvr/core";
import { stream } from "../..";

const app = new App();

// Serve the public directory
app.use(stream(import.meta.dir + "/public/text.txt"));

// Serve using Bun
export default app;