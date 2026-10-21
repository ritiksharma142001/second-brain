import Link from "next/link";
import { Cassette } from "@/components/features/mixtapes/Cassette";
import { formatDuration } from "@/lib/mixtape";
import type { MixtapeCardData } from "@/lib/mixtape-data";

/** A cassette on the shelf. Lifts and tilts slightly on hover, like pulling it out. */
export function MixtapeCard({
  tape,
  showStatus = false,
}: {
  tape: MixtapeCardData;
  showStatus?: boolean;
}) {
  const total = tape.tracks.reduce((sum, t) => sum + t.durationSec, 0);

  return (
    <Link
      href={`/mixtapes/${tape.id}`}
      className="group block focus-visible:outline-none"
    >
      <div className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-1 group-focus-visible:-translate-y-1">
        <Cassette
          title={tape.title}
          dedication={tape.dedication}
          color={tape.color}
          tapeLength={tape.tapeLength}
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium transition-colors group-hover:text-highlight">
            {tape.title}
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {tape.author.name ?? "Anonymous"} · {tape.tracks.length}{" "}
            {tape.tracks.length === 1 ? "song" : "songs"} ·{" "}
            {formatDuration(total)}
          </p>
        </div>
        {showStatus && (
          <span className="sticker shrink-0">
            {tape.isPublic ? "public" : "private"}
          </span>
        )}
      </div>
    </Link>
  );
}
