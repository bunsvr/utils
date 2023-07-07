import { stream } from "../..";

// Serve using Bun
export default {
    fetch: stream(import.meta.dir + '/public')
};
