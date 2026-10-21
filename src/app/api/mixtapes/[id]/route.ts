import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  forbidden,
  jsonError,
  limitOrResponse,
  notFound,
  parseBody,
  unauthorized,
} from "@/lib/api";
import { mixtapeSchema } from "@/lib/mixtape";
import { getMixtapeForViewer, trackRows } from "@/lib/mixtape-data";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  const session = await getServerSession();
  const found = await getMixtapeForViewer((await params).id, session?.user);
  if (!found) return notFound("Mixtape not found");
  return NextResponse.json(found.tape);
}

/** Replaces the tape and its whole track list. Only the owner may edit. */
export async function PUT(request: NextRequest, { params }: Ctx) {
  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();

  const limited = await limitOrResponse("write", session.user.id);
  if (limited) return limited;

  const { id } = await params;
  const existing = await prisma.mixtape.findUnique({
    where: { id },
    select: { authorId: true, isPublic: true, publishedAt: true },
  });
  // Someone else's private tape looks the same as a missing one.
  if (
    !existing ||
    (existing.authorId !== session.user.id && !existing.isPublic)
  )
    return notFound("Mixtape not found");
  if (existing.authorId !== session.user.id) return forbidden();

  const body = await parseBody(request, mixtapeSchema);
  if ("error" in body) return body.error;
  const { tracks: _tracks, ...tape } = body.data;

  try {
    await prisma.$transaction([
      prisma.mixtapeTrack.deleteMany({ where: { mixtapeId: id } }),
      prisma.mixtape.update({
        where: { id },
        data: {
          ...tape,
          // Keep the original publish date when re-saving; clear it when made private.
          publishedAt: tape.isPublic
            ? (existing.publishedAt ?? new Date())
            : null,
          tracks: { create: trackRows(body.data) },
        },
      }),
    ]);
    return NextResponse.json({ id });
  } catch (error) {
    console.error("Error updating mixtape:", error);
    return jsonError("Failed to save the mixtape", 500);
  }
}

/** The owner can delete their tape; admins can remove public ones (moderation), never private ones. */
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();

  const { id } = await params;
  const existing = await prisma.mixtape.findUnique({
    where: { id },
    select: { authorId: true, isPublic: true },
  });
  const isOwner = existing?.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!existing || (!isOwner && !existing.isPublic))
    return notFound("Mixtape not found");
  if (!isOwner && !isAdmin) return forbidden();

  await prisma.mixtape.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
