import { Buchta } from "buchta";
import { basename, dirname } from "path";
import { Plugin, Router } from "@stricjs/router";
import { html } from "./helpers";

const extraRoutes: Map<string, any> = new Map();

const earlyHook = (build: Buchta) => {
    build.on("fileLoad", data => {
        const { path } = data;
        data.route = "/" + basename(path);
        extraRoutes.set(data.route, () => new Response(Bun.file(path)));
    });
}

const fixRoute = (route: string) => {
    if (!route.endsWith("/")) route += "/";
    return route;
}

export default async (buchta?: Buchta): Promise<Plugin> => {
    buchta.earlyHook = earlyHook;
    buchta ||= new Buchta;
    await buchta.setup();

    return (app: Router) => {
        for (const args of extraRoutes) app.get(...args);

        // @ts-ignore
        for (const route of buchta.pages) {
            if (route.func) {
                const routeDir = dirname(route.route), 
                    fixedRouteDir = fixRoute(routeDir), 
                    { func } = route;
                app.get(routeDir, () => func(routeDir, fixedRouteDir).then(html));
            } else {
                if (!buchta.config?.ssr && "html" in route) {
                    const { html: routeHTML } = route;
                    app.get(dirname(route.route), () => html(routeHTML));
                }

                if (!("html" in route)) {
                    const { path } = route;
                    app.get(route.route, () => new Response(Bun.file(path)));
                    app.get(route.originalRoute, () => new Response(Bun.file(path)));
                }
            }
        }
        
        buchta.logger("Buchta is running on top of Stric!", "info");
        if (buchta.config?.port)
           app.port = buchta.config?.port;
    };
}
