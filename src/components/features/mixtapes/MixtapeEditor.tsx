"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Cassette } from "@/components/features/mixtapes/Cassette";
import {
  LABEL_COLORS,
  LABEL_COLOR_KEYS,
  LIMITS,
  TAPE_LENGTHS,
  formatDuration,
  isHttpUrl,
  parseDuration,
  sideCapacitySec,
  sideTotalSec,
  type LabelColor,
  type Side,
} from "@/lib/mixtape";
import { cn } from "@/lib/utils";

interface EditorTrack {
  key: string;
  side: Side;
  title: string;
  artist: string;
  year: number | null;
  durationSec: number;
  note: string;
  link: string;
}

export interface MixtapeEditorInitial {
  id: string;
  title: string;
  dedication: string | null;
  note: string | null;
  tapeLength: number;
  color: string;
  isPublic: boolean;
  tracks: (Omit<EditorTrack, "key" | "note" | "link"> & {
    note: string | null;
    link: string | null;
  })[];
}

const emptyDraft = (side: Side) => ({
  side,
  title: "",
  artist: "",
  year: "",
  length: "",
  note: "",
  link: "",
});
const otherSide = (side: Side): Side => (side === "A" ? "B" : "A");

export function MixtapeEditor({ initial }: { initial?: MixtapeEditorInitial }) {
  const router = useRouter();
  const nextKey = useRef(0);
  const keyFor = () => `t${nextKey.current++}`;
  const formRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [dedication, setDedication] = useState(initial?.dedication ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [tapeLength, setTapeLength] = useState<number>(
    initial?.tapeLength ?? 60,
  );
  const [color, setColor] = useState<LabelColor>(
    (initial?.color && initial.color in LABEL_COLORS
      ? initial.color
      : "sunset") as LabelColor,
  );
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [tracks, setTracks] = useState<EditorTrack[]>(() =>
    (initial?.tracks ?? []).map((t) => ({
      ...t,
      key: `t-init-${Math.random()}`,
      note: t.note ?? "",
      link: t.link ?? "",
    })),
  );

  const [draft, setDraft] = useState(emptyDraft("A"));
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftError, setDraftError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const capacity = sideCapacitySec(tapeLength);
  const totals = { A: sideTotalSec(tracks, "A"), B: sideTotalSec(tracks, "B") };
  const overfull = (["A", "B"] as const).filter((s) => totals[s] > capacity);

  const focusForm = (side: Side) => {
    setDraft((d) => ({ ...d, side }));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => titleInputRef.current?.focus(), 300);
  };

  const submitDraft = () => {
    setDraftError("");
    const songTitle = draft.title.trim();
    const artist = draft.artist.trim();
    if (!songTitle || !artist)
      return setDraftError("Add the song title and the artist.");

    const durationSec = parseDuration(draft.length);
    if (durationSec === null)
      return setDraftError("Write the length like 3:45.");
    if (durationSec < LIMITS.minTrackSec || durationSec > LIMITS.maxTrackSec)
      return setDraftError("A song should be between 0:10 and 20:00.");

    let year: number | null = null;
    if (draft.year.trim()) {
      year = Number(draft.year);
      if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > new Date().getFullYear() + 1
      )
        return setDraftError("That year doesn't look right.");
    }

    let link = draft.link.trim();
    if (link && !/^https?:\/\//i.test(link) && link.includes("."))
      link = `https://${link}`;
    if (link && !isHttpUrl(link))
      return setDraftError("The listen link should be a web address.");

    // Tape is finite: the song has to fit on the chosen side.
    const used = sideTotalSec(
      tracks.filter((t) => t.key !== editingKey),
      draft.side,
    );
    if (used + durationSec > capacity) {
      const left = Math.max(0, capacity - used);
      return setDraftError(
        `Only ${formatDuration(left)} of tape left on side ${draft.side}. Try side ${otherSide(draft.side)} or a shorter song.`,
      );
    }

    const track: EditorTrack = {
      key: editingKey ?? keyFor(),
      side: draft.side,
      title: songTitle,
      artist,
      year,
      durationSec,
      note: draft.note.trim(),
      link,
    };
    setTracks((current) =>
      editingKey
        ? current.map((t) => (t.key === editingKey ? track : t))
        : [...current, track],
    );
    setEditingKey(null);
    setDraft(emptyDraft(draft.side));
    titleInputRef.current?.focus();
  };

  const startEdit = (track: EditorTrack) => {
    setEditingKey(track.key);
    setDraftError("");
    setDraft({
      side: track.side,
      title: track.title,
      artist: track.artist,
      year: track.year ? String(track.year) : "",
      length: formatDuration(track.durationSec),
      note: track.note,
      link: track.link,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const move = (key: string, direction: -1 | 1) => {
    setTracks((current) => {
      const index = current.findIndex((t) => t.key === key);
      const side = current[index].side;
      // nearest neighbour on the same side
      let swap = index + direction;
      while (swap >= 0 && swap < current.length && current[swap].side !== side)
        swap += direction;
      if (swap < 0 || swap >= current.length) return current;
      const next = [...current];
      [next[index], next[swap]] = [next[swap], next[index]];
      return next;
    });
  };

  const switchSide = (track: EditorTrack) => {
    const target = otherSide(track.side);
    if (totals[target] + track.durationSec > capacity) {
      setDraftError(
        `"${track.title}" doesn't fit on side ${target}: only ${formatDuration(capacity - totals[target])} left.`,
      );
      return;
    }
    // Move it to the end of the other side.
    setTracks((current) => [
      ...current.filter((t) => t.key !== track.key),
      { ...track, side: target },
    ]);
  };

  const remove = (key: string) => {
    setTracks((current) => current.filter((t) => t.key !== key));
    if (editingKey === key) {
      setEditingKey(null);
      setDraft(emptyDraft(draft.side));
    }
  };

  const save = async () => {
    setSaveError("");
    if (!title.trim()) return setSaveError("Give your tape a title.");
    if (tracks.length === 0) return setSaveError("Add at least one song.");
    if (overfull.length)
      return setSaveError(
        `Side ${overfull[0]} has more music than tape. Move or remove a song.`,
      );

    setSaving(true);
    try {
      const response = await fetch(
        initial ? `/api/mixtapes/${initial.id}` : "/api/mixtapes",
        {
          method: initial ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            dedication,
            note,
            tapeLength,
            color,
            isPublic,
            tracks: tracks.map(({ key: _key, ...t }) => t),
          }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSaveError(data.error ?? "Couldn't save the tape. Please try again.");
        return;
      }
      router.push(`/mixtapes/${data.id}`);
      router.refresh();
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-28">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={initial ? `/mixtapes/${initial.id}` : "/mixtapes"}>
            <ArrowLeft /> Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          {initial ? "Edit mixtape" : "Make a mixtape"}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* label + preview */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Cassette
            title={title || "Untitled tape"}
            dedication={dedication}
            color={color}
            tapeLength={tapeLength}
          />

          <Card>
            <CardHeader>
              <CardTitle>The label</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tape-title">Title *</Label>
                <Input
                  id="tape-title"
                  value={title}
                  maxLength={LIMITS.title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summer '98 road trip"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tape-for">For</Label>
                <Input
                  id="tape-for"
                  value={dedication}
                  maxLength={LIMITS.dedication}
                  onChange={(e) => setDedication(e.target.value)}
                  placeholder="Maya, my sister, the night shift..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tape</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TAPE_LENGTHS.map((length) => (
                    <button
                      key={length}
                      type="button"
                      onClick={() => setTapeLength(length)}
                      aria-pressed={tapeLength === length}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left transition-colors",
                        tapeLength === length
                          ? "border-[color:var(--shadow-ink)] bg-primary text-primary-foreground"
                          : "bg-background/60 hover:bg-accent",
                      )}
                    >
                      <span className="block font-mono text-sm font-bold">
                        C{length}
                      </span>
                      <span className="block text-xs opacity-80">
                        {length / 2} min a side
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Label colour</Label>
                <div className="flex flex-wrap gap-2">
                  {LABEL_COLOR_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setColor(key)}
                      aria-pressed={color === key}
                      aria-label={LABEL_COLORS[key].name}
                      title={LABEL_COLORS[key].name}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                        color === key
                          ? "border-[color:var(--shadow-ink)] ring-2 ring-ring ring-offset-2 ring-offset-background"
                          : "border-transparent",
                      )}
                      style={{
                        background: `linear-gradient(135deg, ${LABEL_COLORS[key].from}, ${LABEL_COLORS[key].to})`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tape-note">Liner note</Label>
                <Textarea
                  id="tape-note"
                  value={note}
                  maxLength={LIMITS.note}
                  rows={4}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="A letter to whoever plays this tape..."
                />
                <p className="text-right font-mono text-xs text-muted-foreground">
                  {note.length}/{LIMITS.note}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* the two sides + add song */}
        <div className="space-y-6">
          {(["A", "B"] as const).map((side) => {
            const sideTracks = tracks.filter((t) => t.side === side);
            const used = totals[side];
            const over = used > capacity;
            return (
              <section
                key={side}
                aria-labelledby={`side-${side}`}
                className="rounded-xl border bg-card/90 p-4 shadow-[3px_3px_0_0_var(--shadow-ink)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 id={`side-${side}`} className="text-lg font-bold">
                    Side {side}
                  </h2>
                  <p
                    className={cn(
                      "font-mono text-xs",
                      over ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {formatDuration(used)} / {formatDuration(capacity)} ·{" "}
                    {over
                      ? `${formatDuration(used - capacity)} too long`
                      : `${formatDuration(capacity - used)} left`}
                  </p>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
                  role="meter"
                  aria-label={`Tape used on side ${side}`}
                  aria-valuemin={0}
                  aria-valuemax={capacity}
                  aria-valuenow={Math.min(used, capacity)}
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      over ? "bg-destructive" : "bg-highlight",
                    )}
                    style={{
                      width: `${Math.min(100, (used / capacity) * 100)}%`,
                    }}
                  />
                </div>

                {sideTracks.length === 0 ? (
                  <p className="mt-4 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    Side {side} is empty.{" "}
                    <button
                      type="button"
                      className="font-medium text-foreground underline"
                      onClick={() => focusForm(side)}
                    >
                      Add a song
                    </button>
                  </p>
                ) : (
                  <ol className="mt-4 space-y-2">
                    {sideTracks.map((track, index) => (
                      <li
                        key={track.key}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border bg-background/60 p-2",
                          editingKey === track.key &&
                            "border-[color:var(--highlight)]",
                        )}
                      >
                        <span className="w-6 shrink-0 text-center font-mono text-xs text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {track.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {track.artist}
                            {track.year ? ` · ${track.year}` : ""}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatDuration(track.durationSec)}
                        </span>
                        <div className="flex shrink-0">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            aria-label={`Move ${track.title} up`}
                            disabled={index === 0}
                            onClick={() => move(track.key, -1)}
                          >
                            <ChevronUp />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            aria-label={`Move ${track.title} down`}
                            disabled={index === sideTracks.length - 1}
                            onClick={() => move(track.key, 1)}
                          >
                            <ChevronDown />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            aria-label={`Move ${track.title} to side ${otherSide(side)}`}
                            title={`Move to side ${otherSide(side)}`}
                            onClick={() => switchSide(track)}
                          >
                            <ArrowLeftRight />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            aria-label={`Edit ${track.title}`}
                            onClick={() => startEdit(track)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 hover:text-destructive"
                            aria-label={`Remove ${track.title}`}
                            onClick={() => remove(track.key)}
                          >
                            <X />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            );
          })}

          <div ref={formRef}>
            <Card>
              <CardHeader>
                <CardTitle>{editingKey ? "Edit song" : "Add a song"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitDraft();
                  }}
                >
                  <div
                    className="flex gap-2"
                    role="radiogroup"
                    aria-label="Which side"
                  >
                    {(["A", "B"] as const).map((side) => (
                      <button
                        key={side}
                        type="button"
                        role="radio"
                        aria-checked={draft.side === side}
                        onClick={() => setDraft((d) => ({ ...d, side }))}
                        className={cn(
                          "flex-1 rounded-lg border px-3 py-2 font-mono text-sm transition-colors",
                          draft.side === side
                            ? "border-[color:var(--shadow-ink)] bg-primary text-primary-foreground"
                            : "bg-background/60 hover:bg-accent",
                        )}
                      >
                        Side {side} ·{" "}
                        {formatDuration(Math.max(0, capacity - totals[side]))}{" "}
                        left
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="song-title">Song *</Label>
                      <Input
                        id="song-title"
                        ref={titleInputRef}
                        value={draft.title}
                        maxLength={LIMITS.trackTitle}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, title: e.target.value }))
                        }
                        placeholder="Dreams"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="song-artist">Artist *</Label>
                      <Input
                        id="song-artist"
                        value={draft.artist}
                        maxLength={LIMITS.artist}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, artist: e.target.value }))
                        }
                        placeholder="Fleetwood Mac"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="song-length">Length *</Label>
                      <Input
                        id="song-length"
                        value={draft.length}
                        inputMode="numeric"
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, length: e.target.value }))
                        }
                        placeholder="4:14"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="song-year">Year</Label>
                      <Input
                        id="song-year"
                        value={draft.year}
                        inputMode="numeric"
                        maxLength={4}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, year: e.target.value }))
                        }
                        placeholder="1977"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="song-note">Why this song?</Label>
                    <Textarea
                      id="song-note"
                      rows={2}
                      value={draft.note}
                      maxLength={LIMITS.trackNote}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, note: e.target.value }))
                      }
                      placeholder="The one we played with the windows down."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="song-link">Listen link</Label>
                    <Input
                      id="song-link"
                      value={draft.link}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, link: e.target.value }))
                      }
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional. YouTube, Spotify, Bandcamp... Songs aren&apos;t
                      stored here; we just link out.
                    </p>
                  </div>

                  {draftError && (
                    <p role="alert" className="text-sm text-destructive">
                      {draftError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingKey ? (
                        "Save song"
                      ) : (
                        <>
                          <Plus /> Add to side {draft.side}
                        </>
                      )}
                    </Button>
                    {editingKey && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingKey(null);
                          setDraft(emptyDraft(draft.side));
                          setDraftError("");
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* publish bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-md">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
          <div
            className="flex gap-2"
            role="radiogroup"
            aria-label="Who can see this tape"
          >
            {[
              { value: false, icon: Lock, label: "Private", hint: "only you" },
              {
                value: true,
                icon: Globe,
                label: "Public",
                hint: "on the shelf",
              },
            ].map(({ value, icon: Icon, label, hint }) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={isPublic === value}
                onClick={() => setIsPublic(value)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  isPublic === value
                    ? "border-[color:var(--shadow-ink)] bg-primary text-primary-foreground"
                    : "bg-background/60 hover:bg-accent",
                )}
              >
                <Icon className="h-4 w-4" /> {label}{" "}
                <span className="hidden text-xs opacity-75 sm:inline">
                  ({hint})
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {saveError && (
              <p role="alert" className="max-w-xs text-sm text-destructive">
                {saveError}
              </p>
            )}
            <Button onClick={save} disabled={saving}>
              {saving
                ? "Saving..."
                : isPublic
                  ? initial?.isPublic
                    ? "Save"
                    : "Publish to the shelf"
                  : "Save privately"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
