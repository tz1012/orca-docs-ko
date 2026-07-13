import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        sourceUrl: z.url().optional(),
        checkedAt: z.iso.datetime().optional(),
        translationNotice: z
          .object({
            title: z.string(),
            message: z.string(),
            rights: z.string(),
          })
          .optional(),
      }),
    }),
  }),
};
