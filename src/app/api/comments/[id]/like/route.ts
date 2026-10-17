import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, limitOrResponse, notFound, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

/** The like count after the change, so the UI can show the exact server value. */
const likeCount = (commentId: string) => prisma.commentLike.count({ where: { commentId } });

export async function POST(_request: NextRequest, { params }: Ctx) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const limited = await limitOrResponse("write", session.user.id);
    if (limited) return limited;

    const { id } = await params;
    const comment = await prisma.comment.findUnique({ where: { id }, select: { id: true } });
    if (!comment) return notFound("Comment not found");

    // Idempotent: liking twice is not an error.
    await prisma.commentLike.upsert({
      where: { userId_commentId: { userId: session.user.id, commentId: id } },
      update: {},
      create: { userId: session.user.id, commentId: id },
    });

    return NextResponse.json({ liked: true, likes: await likeCount(id) });
  } catch (error) {
    console.error("Error liking comment:", error);
    return jsonError("Failed to like comment", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const limited = await limitOrResponse("write", session.user.id);
    if (limited) return limited;

    const { id } = await params;
    // deleteMany: unliking something that is not liked is not an error.
    await prisma.commentLike.deleteMany({ where: { userId: session.user.id, commentId: id } });

    return NextResponse.json({ liked: false, likes: await likeCount(id) });
  } catch (error) {
    console.error("Error unliking comment:", error);
    return jsonError("Failed to unlike comment", 500);
  }
}
