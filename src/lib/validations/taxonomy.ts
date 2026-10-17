import { z } from "zod";
import { isAllowedAvatarUrl } from "@/lib/avatars";

const slug = z
  .string()
  .trim()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

export const tagBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40),
  slug,
});

export const categoryBodySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  slug,
  description: z.string().trim().max(200).optional().nullable(),
});

export const profileBodySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  bio: z.string().trim().max(300, "Bio must be at most 300 characters").optional().nullable(),
  // null removes the picture (initials are shown instead)
  image: z
    .string()
    .refine(isAllowedAvatarUrl, "Please choose one of the available avatars")
    .optional()
    .nullable(),
});

export const commentBodySchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
  parentId: z.string().min(1).optional().nullable(),
});
