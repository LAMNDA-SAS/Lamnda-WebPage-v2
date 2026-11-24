import { defineConfig } from "astro/config";

// Static marketing site: zero-JS default, single HopfHero island.
// Deploys to GitHub Pages (project base path via BASE_PATH) or any static host.
// Astro mirrors `base` verbatim into import.meta.env.BASE_URL, so normalize
// the trailing slash here: templates concatenate `${BASE_URL}asset`.
const basePath = process.env.BASE_PATH ?? "/";
const base = basePath.endsWith("/") ? basePath : `${basePath}/`;

export default defineConfig({
  output: "static",
  site: "https://lamnda-sas.github.io",
  base,
  vite: {
    build: {
      // Keep single-purpose chunks readable; hero 2D canvas is a small
      // sync import (<15KB gzip) that hydrates on idle+visible only.
      chunkSizeWarningLimit: 220,
    },
  },
});
