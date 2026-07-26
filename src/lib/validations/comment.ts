import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000),
  postId: z.string(),
  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  id: z.string(),
  content: z.string().min(1, "Comment cannot be empty").max(1000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
