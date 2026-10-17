"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function removeBookmark(postId: string) {
  const userId = await requireUserId();
  if (!userId) return { error: "Unauthorized" };

  await db.bookmark.deleteMany({ where: { userId, postId } });
  revalidatePath("/dashboard/bookmarks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function removeFromHistory(postId: string) {
  const userId = await requireUserId();
  if (!userId) return { error: "Unauthorized" };

  await db.viewHistory.deleteMany({ where: { userId, postId } });
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function clearHistory() {
  const userId = await requireUserId();
  if (!userId) return { error: "Unauthorized" };

  await db.viewHistory.deleteMany({ where: { userId } });
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard");
  return { success: true };
}
