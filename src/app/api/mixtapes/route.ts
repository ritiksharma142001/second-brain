import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, limitOrResponse, parseBody, unauthorized } from "@/lib/api";
import { mixtapeSchema } from "@/lib/mixtape";
import { trackRows } from "@/lib/mixtape-data";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();

  const limited = await limitOrResponse("write", session.user.id);
  if (limited) return limited;

  const body = await parseBody(request, mixtapeSchema);
  if ("error" in body) return body.error;
  const { tracks: _tracks, ...tape } = body.data;

  try {
    const created = await prisma.mixtape.create({
      data: {
        ...tape,
        publishedAt: tape.isPublic ? new Date() : null,
        authorId: session.user.id,
        tracks: { create: trackRows(body.data) },
      },
      select: { id: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating mixtape:", error);
    return jsonError("Failed to save the mixtape", 500);
  }
}
