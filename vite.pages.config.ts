import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { machineFiles } from "./src/factory/audit.ts";

// Plain client-side build for GitHub Pages (https://adamsuk.github.io/line/).
// `npm run build:pages` writes dist-pages/. The normal `build` is untouched.
const root = fileURLToPath(new URL("./pages", import.meta.url));

// guide.json, llms.txt and llms-full.txt, built from the page's own data and CHANGELOG.md.
function machineReadableGuide(): Plugin {
  return {
    name: "line-machine-readable-guide",
    generateBundle() {
      const changelog = readFileSync(new URL("./CHANGELOG.md", import.meta.url), "utf8");
      for (const [fileName, source] of Object.entries(machineFiles(changelog))) {
        this.emitFile({ type: "asset", fileName, source });
      }
    },
  };
}

export default defineConfig({
  root,
  base: process.env.PAGES_BASE ?? "/line/",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [tailwindcss(), viteReact(), machineReadableGuide()],
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
