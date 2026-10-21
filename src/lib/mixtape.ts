import { z } from "zod";

/** C60 and C90 cassettes: the number is the total minutes; each side holds half. */
export const TAPE_LENGTHS = [60, 90] as const;
export type TapeLength = (typeof TAPE_LENGTHS)[number];
export type Side = "A" | "B";

/** Label colours, as gradient stops. */
export const LABEL_COLORS = {
  sunset: { name: "Sunset", from: "#f7a65a", to: "#e8607a" },
  mint: { name: "Mint", from: "#9be7c4", to: "#3fb8a0" },
  sky: { name: "Sky", from: "#9cc9ff", to: "#5b7cf0" },
  grape: { name: "Grape", from: "#d3a8ff", to: "#8b5bd6" },
  lemon: { name: "Lemon", from: "#ffe682", to: "#f2b632" },
  chrome: { name: "Chrome", from: "#e6e6e6", to: "#9a9a9a" },
} as const;
export type LabelColor = keyof typeof LABEL_COLORS;
export const LABEL_COLOR_KEYS = Object.keys(LABEL_COLORS) as [
  LabelColor,
  ...LabelColor[],
];

export const LIMITS = {
  title: 80,
  dedication: 60,
  note: 600,
  trackTitle: 100,
  artist: 100,
  trackNote: 200,
  maxTracks: 40,
  minTrackSec: 10,
  maxTrackSec: 20 * 60,
} as const;

/** Seconds of tape on one side. */
export const sideCapacitySec = (tapeLength: number) => (tapeLength * 60) / 2;

/** 225 -> "3:45", 3725 -> "62:05" */
export function formatDuration(totalSec: number): string {
  const sec = Math.max(0, Math.round(totalSec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

/** "3:45" or "03:45" -> 225. Anything else -> null. */
export function parseDuration(text: string): number | null {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(text.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function sideTotalSec(
  tracks: { side: Side; durationSec: number }[],
  side: Side,
): number {
  return tracks
    .filter((t) => t.side === side)
    .reduce((sum, t) => sum + t.durationSec, 0);
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

export const trackSchema = z.object({
  side: z.enum(["A", "B"]),
  title: z
    .string()
    .trim()
    .min(1, "Every song needs a title")
    .max(LIMITS.trackTitle),
  artist: z
    .string()
    .trim()
    .min(1, "Every song needs an artist")
    .max(LIMITS.artist),
  year: z
    .number()
    .int()
    .min(1900, "Year looks wrong")
    .max(new Date().getFullYear() + 1, "Year looks wrong")
    .optional()
    .nullable()
    .transform((v) => v ?? null),
  durationSec: z
    .number()
    .int()
    .min(LIMITS.minTrackSec, "A song must be at least 0:10")
    .max(LIMITS.maxTrackSec, "A song can be at most 20:00"),
  note: optionalText(LIMITS.trackNote, "The note"),
  link: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null))
    .refine(
      (v) => v === null || isHttpUrl(v),
      "The listen link must start with http:// or https://",
    ),
});

export const mixtapeSchema = z
  .object({
    title: z.string().trim().min(1, "Give your tape a title").max(LIMITS.title),
    dedication: optionalText(LIMITS.dedication, "The dedication"),
    note: optionalText(LIMITS.note, "The liner note"),
    tapeLength: z.union([z.literal(60), z.literal(90)]),
    color: z.enum(LABEL_COLOR_KEYS),
    isPublic: z.boolean(),
    tracks: z
      .array(trackSchema)
      .min(1, "Add at least one song")
      .max(LIMITS.maxTracks, `A tape holds at most ${LIMITS.maxTracks} songs`),
  })
  .superRefine((tape, ctx) => {
    // Real tape runs out: each side must fit.
    const capacity = sideCapacitySec(tape.tapeLength);
    for (const side of ["A", "B"] as const) {
      const over = sideTotalSec(tape.tracks, side) - capacity;
      if (over > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tracks"],
          message: `Side ${side} is ${formatDuration(over)} over the ${formatDuration(capacity)} limit`,
        });
      }
    }
  });

export type MixtapeInput = z.input<typeof mixtapeSchema>;
export type MixtapeData = z.output<typeof mixtapeSchema>;
