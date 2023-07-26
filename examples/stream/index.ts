import { stream } from "../..";

const fetch = stream(import.meta.dir + '/public');
console.log(fetch.toString())

// Serve using Bun
export default { fetch };
