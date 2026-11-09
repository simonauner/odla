import { defineConfig, type Connect } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { fileURLToPath } from "node:url";

// Appens klientroutes (/app, /app/setup) ska få app.html i dev, som workern gör i produktion.
const appRoutes: Connect.NextHandleFunction = (req, _res, next) => {
  if (req.url && /^\/app(\/[^.]*)?(\?|$)/.test(req.url)) req.url = "/app.html";
  next();
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    { name: "app-routes", configureServer: (s) => void s.middlewares.use(appRoutes) },
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
