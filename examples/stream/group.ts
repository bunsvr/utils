import { group } from "../..";
import { Router } from "@stricjs/router";

// Serve using Bun
export default new Router()
    .plug(group(import.meta.dir + "/public"));
