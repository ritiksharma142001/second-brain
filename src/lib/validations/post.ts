import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  coverImage: z.string().url().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  publishedAt: z.date().optional(),
  scheduledFor: z.date().optional(),
});

export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
