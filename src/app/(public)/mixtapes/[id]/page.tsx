import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Lock, Pencil } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { formatDuration } from "@/lib/mixtape";
import { getMixtapeForViewer } from "@/lib/mixtape-data";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/features/ShareButtons";
import { TapeDeck } from "@/components/features/mixtapes/TapeDeck";
import { DeleteMixtapeButton } from "@/components/features/mixtapes/DeleteMixtapeButton";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await getServerSession();
  const found = await getMixtapeForViewer((await params).id, session?.user);
  if (!found) return { title: "Mixtape not found" };
  return {
    title: `${found.tape.title} · Mixtape`,
    description: found.tape.dedication
      ? `A mixtape for ${found.tape.dedication}`
      : "A cassette mixtape",
    // Private tapes must never be indexed.
    robots: found.tape.isPublic ? undefined : { index: false, follow: false },
  };
}

export default async function MixtapePage({ params }: Props) {
  const session = await getServerSession();
  const found = await getMixtapeForViewer((await params).id, session?.user);
  if (!found) notFound();
  const { tape, isOwner, isAdmin } = found;

  const total = tape.tracks.reduce((sum, t) => sum + t.durationSec, 0);
  const author = tape.author.name ?? "Anonymous";

  return (
    <article className="container py-10 sm:py-14">
      <Link
        href="/mixtapes"
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> the tape shelf
      </Link>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow mb-2">{"// mixtape"}</p>
          <h1 className="font-marker text-4xl leading-tight sm:text-5xl">
            {tape.title}
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            made by {author}
            {tape.publishedAt && ` · ${formatDate(tape.publishedAt)}`} · C
            {tape.tapeLength} · {tape.tracks.length}{" "}
            {tape.tracks.length === 1 ? "song" : "songs"} ·{" "}
            {formatDuration(total)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!tape.isPublic && (
            <span className="sticker">
              <Lock className="h-3 w-3" /> private: only you can see this
            </span>
          )}
          {isOwner && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/mixtapes/${tape.id}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
          )}
          {(isOwner || isAdmin) && (
            <DeleteMixtapeButton
              id={tape.id}
              title={tape.title}
              redirectTo={isOwner ? "/dashboard/mixtapes" : "/mixtapes"}
            />
          )}
        </div>
      </header>

      {(tape.dedication || tape.note) && (
        <aside className="mb-10 max-w-2xl rotate-[-0.6deg] rounded-lg border bg-[#fffaf0] p-5 text-[#2b2118] shadow-[4px_4px_0_0_var(--shadow-ink)] dark:bg-[#f3ead8]">
          {tape.dedication && (
            <p className="font-marker text-xl">For {tape.dedication},</p>
          )}
          {tape.note && (
            <p className="mt-2 whitespace-pre-wrap font-marker leading-relaxed">
              {tape.note}
            </p>
          )}
          <p className="mt-3 text-right font-marker">— {author}</p>
        </aside>
      )}

      <TapeDeck
        title={tape.title}
        dedication={tape.dedication}
        color={tape.color}
        tapeLength={tape.tapeLength}
        tracks={tape.tracks.map((t) => ({
          id: t.id,
          side: t.side,
          title: t.title,
          artist: t.artist,
          year: t.year,
          durationSec: t.durationSec,
          note: t.note,
          link: t.link,
        }))}
      />

      {tape.isPublic && (
        <div className="mt-12 border-t pt-6">
          <ShareButtons
            url={`${siteConfig.url}/mixtapes/${tape.id}`}
            title={`${tape.title}, a mixtape`}
          />
        </div>
      )}
    </article>
  );
}
