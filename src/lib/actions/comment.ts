"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCommentSchema, updateCommentSchema } from "@/lib/validations/comment";
import { revalidatePath } from "next/cache";

export async function createComment(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const validated = createCommentSchema.parse(data);

    const comment = await db.comment.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
      include: {
        user: true,
      },
    });

    revalidatePath(`/blog/*`);
    return { success: true, comment };
  } catch (error) {
    console.error("Create comment error:", error);
    return { error: "Failed to create comment" };
  }
}

export async function updateComment(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const validated = updateCommentSchema.parse(data);

    // Check if user owns the comment
    const existing = await db.comment.findUnique({
      where: { id: validated.id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return { error: "Unauthorized" };
    }

    const comment = await db.comment.update({
      where: { id: validated.id },
      data: { content: validated.content },
    });

    revalidatePath(`/blog/*`);
    return { success: true, comment };
  } catch (error) {
    console.error("Update comment error:", error);
    return { error: "Failed to update comment" };
  }
}

export async function deleteComment(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const existing = await db.comment.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "Comment not found" };
    }

    // Allow deletion if user owns the comment or is admin
    if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    await db.comment.delete({ where: { id } });

    revalidatePath(`/blog/*`);
    return { success: true };
  } catch (error) {
    console.error("Delete comment error:", error);
    return { error: "Failed to delete comment" };
  }
}

export async function toggleCommentLike(commentId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const existing = await db.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    if (existing) {
      await db.commentLike.delete({ where: { id: existing.id } });
      return { success: true, liked: false };
    } else {
      await db.commentLike.create({
        data: {
          userId: session.user.id,
          commentId,
        },
      });
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("Toggle comment like error:", error);
    return { error: "Failed to toggle like" };
  }
}
