import { defineConfig } from "astro/config";

// Static marketing site: zero-JS default, single HopfHero island.
// Deploys to any static host (Cloudflare Pages / Vercel / Netlify).
export default defineConfig({
  output: "static",
  site: "https://lamnda.example.com",
  vite: {
    build: {
      // Keep single-purpose chunks readable; hero three.js is lazy-imported
      // inside the island so it never blocks first paint.
      chunkSizeWarningLimit: 220,
    },
  },
});
