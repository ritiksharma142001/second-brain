import { describe, expect, it } from "vitest";
import {
  formatDuration,
  mixtapeSchema,
  parseDuration,
  sideCapacitySec,
  sideTotalSec,
} from "./mixtape";

const song = (side: "A" | "B", durationSec: number, extra = {}) => ({
  side,
  title: "Song",
  artist: "Artist",
  durationSec,
  ...extra,
});
const tape = (overrides = {}) => ({
  title: "Road trip",
  tapeLength: 60,
  color: "sunset",
  isPublic: false,
  tracks: [song("A", 200)],
  ...overrides,
});

describe("durations", () => {
  it("formats and parses m:ss", () => {
    expect(formatDuration(225)).toBe("3:45");
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(3725)).toBe("62:05");
    expect(parseDuration("3:45")).toBe(225);
    expect(parseDuration(" 03:05 ")).toBe(185);
  });

  it("rejects malformed lengths", () => {
    for (const bad of ["3", "3:5", "3:60", "a:bc", "", "1:2:3", "100:00"])
      expect(parseDuration(bad)).toBeNull();
  });

  it("knows how much fits on a side", () => {
    expect(sideCapacitySec(60)).toBe(1800);
    expect(sideCapacitySec(90)).toBe(2700);
    expect(
      sideTotalSec([song("A", 100), song("B", 50), song("A", 20)], "A"),
    ).toBe(120);
  });
});

describe("mixtapeSchema", () => {
  it("accepts a normal tape and tidies empty optional fields", () => {
    const parsed = mixtapeSchema.parse(
      tape({
        dedication: "  ",
        tracks: [song("A", 200, { link: "", note: "", year: null })],
      }),
    );
    expect(parsed.dedication).toBeNull();
    expect(parsed.tracks[0].link).toBeNull();
    expect(parsed.tracks[0].note).toBeNull();
  });

  it("refuses an overfilled side, like real tape", () => {
    const result = mixtapeSchema.safeParse(
      tape({ tracks: [song("A", 1000), song("A", 900)] }),
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Side A is 1:40 over the 30:00 limit",
    );
  });

  it("lets a C90 hold more", () => {
    // 43:20 on one side: too much for a C60 side (30:00), fine for a C90 side (45:00)
    const side = [song("B", 1100), song("B", 1100), song("B", 400)];
    expect(
      mixtapeSchema.safeParse(tape({ tapeLength: 60, tracks: side })).success,
    ).toBe(false);
    expect(
      mixtapeSchema.safeParse(tape({ tapeLength: 90, tracks: side })).success,
    ).toBe(true);
  });

  it("rejects unsafe links, unknown colours and odd tape lengths", () => {
    expect(
      mixtapeSchema.safeParse(
        tape({ tracks: [song("A", 200, { link: "javascript:alert(1)" })] }),
      ).success,
    ).toBe(false);
    expect(mixtapeSchema.safeParse(tape({ color: "neon" })).success).toBe(
      false,
    );
    expect(mixtapeSchema.safeParse(tape({ tapeLength: 120 })).success).toBe(
      false,
    );
    expect(mixtapeSchema.safeParse(tape({ tracks: [] })).success).toBe(false);
  });
});
