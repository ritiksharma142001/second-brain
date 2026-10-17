import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, limitOrResponse, notFound, parseBody, unauthorized } from "@/lib/api";
import { commentBodySchema } from "@/lib/validations/taxonomy";
import { MAX_COMMENT_DEPTH } from "@/lib/comments";

const authorSelect = { id: true, name: true, image: true } as const;

/** Fields loaded for every comment; `likes` is limited to the viewer's own like. */
const commentFields = (viewerId?: string) => ({
  user: { select: authorSelect },
  _count: { select: { likes: true, replies: true } },
  ...(viewerId ? { likes: { where: { userId: viewerId }, select: { id: true } } } : {}),
});

type CommentNode = {
  user: unknown;
  likes?: unknown;
  replies?: CommentNode[];
  [key: string]: unknown;
};

/**
 * The comment components expect the commenter as `author` (the DB relation is `user`)
 * and a `likedByMe` flag instead of the raw likes list.
 */
function toClientComment(comment: CommentNode): Record<string, unknown> {
  const { user, likes, replies, ...rest } = comment;
  return {
    ...rest,
    author: user,
    likedByMe: Array.isArray(likes) && likes.length > 0,
    ...(replies ? { replies: replies.map(toClientComment) } : {}),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    const viewerId = session?.user?.id;
    const asc = { createdAt: "asc" } as const;

    const comments = await prisma.comment.findMany({
      where: { postId: id, parentId: null },
      include: {
        ...commentFields(viewerId),
        replies: {
          include: {
            ...commentFields(viewerId),
            replies: {
              include: commentFields(viewerId),
              orderBy: asc,
            },
          },
          orderBy: asc,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(comments.map(toClientComment));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return jsonError("Failed to fetch comments", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const limited = await limitOrResponse("comment", session.user.id);
    if (limited) return limited;

    const body = await parseBody(request, commentBodySchema);
    if ("error" in body) return body.error;
    const { content, parentId } = body.data;

    const { id } = await params;

    const post = await prisma.post.findFirst({
      where: { id, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!post) return notFound("Post not found");

    if (parentId) {
      // Walk up to work out how deep the parent already is.
      const parent = await prisma.comment.findFirst({
        where: { id: parentId, postId: id },
        select: { parentId: true, parent: { select: { parentId: true } } },
      });
      if (!parent) return jsonError("Parent comment not found", 400);

      const parentDepth = !parent.parentId ? 0 : !parent.parent?.parentId ? 1 : 2;
      if (parentDepth >= MAX_COMMENT_DEPTH) {
        return jsonError("Replies can only go two levels deep", 400);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: id,
        userId: session.user.id,
        parentId: parentId || null,
      },
      include: commentFields(session.user.id),
    });

    return NextResponse.json(toClientComment(comment), { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return jsonError("Failed to create comment", 500);
  }
}
