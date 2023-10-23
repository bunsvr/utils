import { BasicCredentials as Basic, extractBasic } from "./basic";
import { extractBearer } from "./bearer";

export namespace auth {
    /**
     * Extract username and password from authentication headers
     */
    export declare function basic(req: Request): BasicCredentials | null;

    /**
     * Basic credentials `[username, password]`
     */
    export type BasicCredentials = Basic;

    /**
     * Extract bearer token from authentication headers
     */
    export declare function bearer(req: Request): string | null;
}

auth.basic = req => {
    var str = req.headers.get('Authorization');
    if (str === null) {
        str = req.headers.get('Proxy-Authorization');
        if (str === null) return null;
    }

    return extractBasic(str);
};

auth.bearer = req => {
    var str = req.headers.get('Authorization');
    if (str === null) {
        str = req.headers.get('Proxy-Authorization');
        if (str === null) return null;
    }

    return extractBearer(str);
};
