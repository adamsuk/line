import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Plain client-side build for GitHub Pages (https://adamsuk.github.io/line/).
// `npm run build:pages` writes dist-pages/. The normal `build` is untouched.
const root = fileURLToPath(new URL("./pages", import.meta.url));

export default defineConfig({
  root,
  base: process.env.PAGES_BASE ?? "/line/",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [tailwindcss(), viteReact()],
  // The deployed commit's date and sha come from pages.yml. Locally, fall back to build time.
  define: {
    __BUILD_TIME__: JSON.stringify(process.env.LINE_BUILD_TIME || new Date().toISOString()),
    __BUILD_SHA__: JSON.stringify(process.env.LINE_BUILD_SHA ?? ""),
  },
  build: {
    outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)),
    emptyOutDir: true,
  },
});
