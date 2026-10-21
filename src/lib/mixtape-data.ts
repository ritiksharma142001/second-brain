import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { MixtapeData } from "@/lib/mixtape";

const fullInclude = {
  author: { select: { id: true, name: true, image: true } },
  tracks: { orderBy: [{ side: "asc" }, { position: "asc" }] },
} satisfies Prisma.MixtapeInclude;

export type FullMixtape = Prisma.MixtapeGetPayload<{
  include: typeof fullInclude;
}>;

interface Viewer {
  id?: string;
  role?: string;
}

/**
 * A tape plus what the viewer may do with it. Private tapes are visible to their owner only,
 * admins included in "everyone else": they moderate public tapes. Others get null, so a private
 * tape's existence isn't revealed.
 */
export async function getMixtapeForViewer(id: string, viewer?: Viewer | null) {
  const tape = await db.mixtape.findUnique({
    where: { id },
    include: fullInclude,
  });
  if (!tape) return null;

  const isOwner = !!viewer?.id && viewer.id === tape.authorId;
  const isAdmin = viewer?.role === "ADMIN";
  if (!tape.isPublic && !isOwner) return null;

  return { tape, isOwner, isAdmin };
}

/** Track rows in the order they were given, numbered per side. */
export function trackRows(data: MixtapeData) {
  const position = { A: 0, B: 0 };
  return data.tracks.map((track) => ({
    ...track,
    position: position[track.side]++,
  }));
}

const cardSelect = {
  id: true,
  title: true,
  dedication: true,
  color: true,
  tapeLength: true,
  isPublic: true,
  publishedAt: true,
  updatedAt: true,
  author: { select: { name: true } },
  tracks: { select: { durationSec: true } },
} satisfies Prisma.MixtapeSelect;

export type MixtapeCardData = Prisma.MixtapeGetPayload<{
  select: typeof cardSelect;
}>;

export function listPublicMixtapes(take = 48) {
  return db.mixtape.findMany({
    where: { isPublic: true },
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export function listMixtapesByAuthor(authorId: string) {
  return db.mixtape.findMany({
    where: { authorId },
    select: cardSelect,
    orderBy: { updatedAt: "desc" },
  });
}
