"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";
import { revalidatePath } from "next/cache";
import { calculateReadingTime, generateSlug } from "@/lib/utils";

export async function createPost(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    const validated = createPostSchema.parse(data);
    
    // Ensure slug is unique
    let slug = validated.slug || generateSlug(validated.title);
    const existingPost = await db.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const readingTime = calculateReadingTime(validated.content);

    const post = await db.post.create({
      data: {
        ...validated,
        slug,
        readingTime,
        authorId: session.user.id,
        publishedAt: validated.status === "PUBLISHED" ? new Date() : null,
        tags: validated.tags
          ? {
              connectOrCreate: validated.tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag, slug: generateSlug(tag) },
              })),
            }
          : undefined,
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    return { success: true, post };
  } catch (error) {
    console.error("Create post error:", error);
    return { error: "Failed to create post" };
  }
}

export async function updatePost(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    const validated = updatePostSchema.parse(data);
    const { id, tags, ...updateData } = validated;

    const readingTime = updateData.content
      ? calculateReadingTime(updateData.content)
      : undefined;

    const post = await db.post.update({
      where: { id },
      data: {
        ...updateData,
        readingTime,
        tags: tags
          ? {
              set: [],
              connectOrCreate: tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag, slug: generateSlug(tag) },
              })),
            }
          : undefined,
      },
    });

    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    return { success: true, post };
  } catch (error) {
    console.error("Update post error:", error);
    return { error: "Failed to update post" };
  }
}

export async function deletePost(id: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    await db.post.delete({ where: { id } });

    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("Delete post error:", error);
    return { error: "Failed to delete post" };
  }
}

export async function toggleBookmark(postId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const existing = await db.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
      return { success: true, bookmarked: false };
    } else {
      await db.bookmark.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });
      return { success: true, bookmarked: true };
    }
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    return { error: "Failed to toggle bookmark" };
  }
}

export async function incrementViews(postId: string) {
  try {
    await db.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });
    return { success: true };
  } catch (error) {
    console.error("Increment views error:", error);
    return { error: "Failed to increment views" };
  }
}
