import { svelte } from "buchta/plugins/svelte";

import { BuchtaConfig } from "buchta";

export default {
    port: 3000,
    ssr: true,
    rootDir: import.meta.dir,
    plugins: [svelte()],
} as BuchtaConfig;
