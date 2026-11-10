export default {
  fetch(req, env) {
    const url = new URL(req.url);
    // Appens klientroutes (/app/setup) finns inte som filer; svara med appens HTML.
    if (url.pathname.startsWith("/app/")) return env.ASSETS.fetch(new URL("/app", url));
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
