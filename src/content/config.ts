import { defineCollection, z } from "astro:content";

const pillarEnum = z.enum(["data", "security", "automation"]);

export const service = z.object({
  title: z.string(),
  pillar: pillarEnum,
  priority: z.number().int().min(1).max(8),
  summary: z.string(),
  bullets: z.array(z.string()).max(5),
  lang: z.enum(["es", "en"]),
  card: z.enum(["full", "summary"]),
  draftLabel: z.string().optional(),
  outcome: z.string().optional(),
});

export const pillar = z.object({
  title: z.string(),
  key: z.enum(["data", "security", "automation"]),
  tagline: z.string(),
  lang: z.enum(["es", "en"]),
});

export const vision = z.object({
  title: z.string(),
  status: z.enum(["final", "tbd"]),
  lang: z.enum(["es", "en"]),
});

export const mission = z.object({
  title: z.string(),
  status: z.enum(["final", "tbd"]),
  lang: z.enum(["es", "en"]),
});

const services = defineCollection({ type: "content", schema: service });
const pillars = defineCollection({ type: "content", schema: pillar });
const visionCol = defineCollection({ type: "content", schema: vision });
const missionCol = defineCollection({ type: "content", schema: mission });

export const collections = {
  services,
  pillars,
  vision: visionCol,
  mission: missionCol,
};
