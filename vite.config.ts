import { defineConfig, type Connect } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { fileURLToPath } from "node:url";
import { CROPS } from "./shared/crops";

// Appens klientroutes (/app, /app/setup) ska få app.html i dev, som workern gör i produktion.
const appRoutes: Connect.NextHandleFunction = (req, _res, next) => {
  if (req.url && /^\/app(\/[^.]*)?(\?|$)/.test(req.url)) req.url = "/app.html";
  next();
};

// Build time as version, like Kuta: 20261110.1432
const version = new Date().toISOString().replace(/[-:]/g, "").slice(0, 13).replace("T", ".");

// Fills the static start page with data from the code base at build time.
const startPage: Record<string, string> = {
  "<!--crop-count-->": String(CROPS.length),
  "<!--crop-list-->": CROPS.map(
    (c) => `<li class="rounded-full bg-secondary px-4 py-1.5 font-medium text-secondary-foreground">${c.name}</li>`,
  ).join(""),
  "<!--year-->": String(new Date().getFullYear()),
  "<!--version-->": version,
};

export default defineConfig({
  define: { "import.meta.env.VITE_APP_VERSION": JSON.stringify(version) },
  plugins: [
    react(),
    tailwindcss(),
    { name: "app-routes", configureServer: (s) => void s.middlewares.use(appRoutes) },
    {
      name: "start-page",
      transformIndexHtml: (html) => html.replace(/<!--[a-z-]+-->/g, (m) => startPage[m] ?? m),
    },
    cloudflare(),
  ],
  // Två sidor: statisk startsida (index.html) och appen (app.html). Bara klientbygget, inte workern.
  environments: {
    client: {
      build: {
        rollupOptions: {
          input: {
            index: fileURLToPath(new URL("./index.html", import.meta.url)),
            app: fileURLToPath(new URL("./app.html", import.meta.url)),
          },
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
    },
  },
});
