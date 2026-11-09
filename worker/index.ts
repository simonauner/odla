import { app } from "./app";

export default {
  fetch(req, env, ctx) {
    const url = new URL(req.url);
    // Appens klientroutes (/app/setup) finns inte som filer; svara med appens HTML.
    if (url.pathname.startsWith("/app/")) return env.ASSETS.fetch(new URL("/app", url));
    return app.fetch(req, env, ctx);
  },
} satisfies ExportedHandler<Env>;
