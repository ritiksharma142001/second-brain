"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  ExternalLink,
  Pause,
  Play,
  Rewind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cassette } from "@/components/features/mixtapes/Cassette";
import { formatDuration, sideCapacitySec, type Side } from "@/lib/mixtape";
import { cn } from "@/lib/utils";

export interface DeckTrack {
  id: string;
  side: Side;
  title: string;
  artist: string;
  year: number | null;
  durationSec: number;
  note: string | null;
  link: string | null;
}

interface TapeDeckProps {
  title: string;
  dedication: string | null;
  color: string;
  tapeLength: number;
  tracks: DeckTrack[];
}

/**
 * The cassette player. Songs are not hosted here, so "playing" runs the tape in real time:
 * the reels turn, the counter ticks and the current song is marked; each song links out to listen.
 */
export function TapeDeck({
  title,
  dedication,
  color,
  tapeLength,
  tracks,
}: TapeDeckProps) {
  const [side, setSide] = useState<Side>("A");
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [flipCount, setFlipCount] = useState(0);

  const sideTracks = useMemo(
    () => tracks.filter((t) => t.side === side),
    [tracks, side],
  );
  // Start time of each song on this side: 0, then the running total of the songs before it.
  const starts = useMemo(
    () =>
      sideTracks.reduce<number[]>((acc, _track, i) => {
        acc.push(i === 0 ? 0 : acc[i - 1] + sideTracks[i - 1].durationSec);
        return acc;
      }, []),
    [sideTracks]
  );
  const sideLength = sideTracks.reduce((sum, t) => sum + t.durationSec, 0);
  const ended = sideLength > 0 && elapsed >= sideLength;
  const currentIndex = ended
    ? -1
    : starts.findLastIndex((start) => elapsed >= start);
  const current =
    currentIndex >= 0 && (playing || elapsed > 0)
      ? sideTracks[currentIndex]
      : null;

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= sideLength) {
          setPlaying(false);
          return sideLength;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, sideLength]);

  const flip = () => {
    setPlaying(false);
    setElapsed(0);
    setSide((s) => (s === "A" ? "B" : "A"));
    setFlipCount((n) => n + 1);
  };

  const cue = (index: number) => {
    setElapsed(starts[index]);
    setPlaying(true);
  };

  const otherSide: Side = side === "A" ? "B" : "A";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* deck */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div key={flipCount} className={cn(flipCount > 0 && "tape-flip")}>
          <Cassette
            title={title}
            dedication={dedication}
            color={color}
            tapeLength={tapeLength}
            side={side}
            spinning={playing}
          />
        </div>

        <div className="mt-6 rounded-xl border bg-card/90 p-4 shadow-[3px_3px_0_0_var(--shadow-ink)]">
          <div className="flex items-center justify-between gap-3">
            <div
              className="flex gap-1"
              aria-label={`Tape counter ${formatDuration(elapsed)}`}
            >
              {String(Math.floor(elapsed / 3) % 1000)
                .padStart(3, "0")
                .split("")
                .map((digit, i) => (
                  <span
                    key={i}
                    className="rounded bg-[#1a1715] px-1.5 py-0.5 font-mono text-lg text-[#f3ead8]"
                  >
                    {digit}
                  </span>
                ))}
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {formatDuration(elapsed)} / {formatDuration(sideLength)}
              <span className="opacity-60">
                {" "}
                · side holds {formatDuration(sideCapacitySec(tapeLength))}
              </span>
            </p>
          </div>

          <p aria-live="polite" className="mt-3 min-h-5 truncate text-sm">
            {ended ? (
              <span className="text-highlight">
                End of side {side}. Flip the tape!
              </span>
            ) : current ? (
              <>
                <span className="font-mono text-xs text-muted-foreground">
                  now playing ·{" "}
                </span>
                {current.title}{" "}
                <span className="text-muted-foreground">
                  by {current.artist}
                </span>
              </>
            ) : sideTracks.length === 0 ? (
              <span className="text-muted-foreground">
                Side {side} is blank.
              </span>
            ) : (
              <span className="text-muted-foreground">
                Press play, or pick a song to cue it.
              </span>
            )}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() =>
                ended
                  ? (setElapsed(0), setPlaying(true))
                  : setPlaying((p) => !p)
              }
              disabled={sideTracks.length === 0}
            >
              {playing ? <Pause /> : <Play />} {playing ? "Pause" : "Play"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setElapsed(0)}
              disabled={elapsed === 0}
            >
              <Rewind /> Rewind
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={flip}>
              <ArrowLeftRight /> Flip to side {otherSide}
            </Button>
          </div>
        </div>
      </div>

      {/* track list for the side in the deck */}
      <section aria-labelledby="side-heading">
        <h2 id="side-heading" className="eyebrow mb-3">
          {`// side ${side} · ${sideTracks.length} ${sideTracks.length === 1 ? "song" : "songs"}`}
        </h2>
        {sideTracks.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nothing recorded on side {side}. Flip back to side {otherSide}.
          </p>
        ) : (
          <ol className="space-y-2">
            {sideTracks.map((track, index) => {
              const isCurrent = current?.id === track.id;
              return (
                <li key={track.id}>
                  <div
                    className={cn(
                      "group rounded-xl border bg-card/90 p-3 transition-colors",
                      isCurrent
                        ? "border-[color:var(--highlight)] bg-accent"
                        : "hover:bg-accent/60",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => cue(index)}
                        aria-label={`Cue ${track.title}`}
                        className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none"
                      >
                        <span className="w-6 shrink-0 pt-0.5 font-mono text-sm text-muted-foreground">
                          {isCurrent && playing
                            ? "▶"
                            : String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium leading-snug">
                            {track.title}
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            {track.artist}
                            {track.year ? ` · ${track.year}` : ""}
                          </span>
                          {track.note && (
                            <span className="mt-1.5 block font-marker text-sm leading-snug text-foreground/80">
                              “{track.note}”
                            </span>
                          )}
                        </span>
                      </button>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatDuration(track.durationSec)}
                        </span>
                        {track.link && (
                          <a
                            href={track.link}
                            target="_blank"
                            rel="noopener noreferrer nofollow ugc"
                            className="inline-flex items-center gap-1 text-xs underline hover:text-highlight"
                          >
                            listen <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
