# Lamnda Marketing Site v1

Static marketing site for **Lamnda SAS** — scientific-professional awareness,
portfolio-first discovery, contact secondary.

## Stack

- [Astro](https://astro.build) static output (`output: "static"`), zero-JS default
- Vanilla [Three.js](https://threejs.org) island (`HopfHero`, `client:idle`)
- Content Collections (Zod) for services / pillars / vision / mission
- Vitest (unit) + Playwright (e2e)

## Commands

```sh
npm install
npm run dev       # local dev server
npm run build     # static export to dist/
npm run preview   # preview the static build
npm test          # vitest unit suite
npm run test:e2e  # playwright e2e suite
```

## Content editing

Official texts swap via Markdown only — no code change needed:

- `src/content/services/*.md` (4 `full` + 3 `summary` cards)
- `src/content/pillars/*.md` (3 pillars)
- `src/content/vision/vision.md`, `src/content/mission/mission.md` (TBD placeholders)

Re-run `npm run build` after editing.

## Hero poster

`public/hero-poster.webp` (<100KB) paints before WebGL hydrates:

```sh
npm run generate:poster
```

## Escape hatch

Poster-only hero (no WebGL) via env:

```sh
PUBLIC_HOPF_ENABLED=false npm run build
```

## Deploy

Any static host (Cloudflare Pages / Vercel / Netlify) serving `dist/`.
