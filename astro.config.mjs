import { defineConfig } from "astro/config";

// Static marketing site: zero-JS default, single HopfHero island.
// Deploys to any static host (Cloudflare Pages / Vercel / Netlify).
export default defineConfig({
  output: "static",
  site: "https://lamnda.example.com",
  vite: {
    build: {
      // Keep single-purpose chunks readable; hero 2D canvas is a small
      // sync import (<15KB gzip) that hydrates on idle+visible only.
      chunkSizeWarningLimit: 220,
    },
  },
});
