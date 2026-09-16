import { defineCollection, z } from 'astro:content';

const sessions = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      coverImage: image(),
      coverAlt: z.string().min(1),
      images: z.array(
        z.object({
          src: image(),
          alt: z.string().min(1),
          orientation: z.enum(['portrait', 'landscape']),
        })
      ),
      provisional: z.boolean().default(true),
    }),
});

export const collections = { sessions };
