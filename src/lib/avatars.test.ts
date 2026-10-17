import { describe, expect, it } from "vitest";
import { AVATAR_SEEDS, AVATAR_STYLES, buildAvatarUrl, isAllowedAvatarUrl } from "./avatars";

describe("avatars", () => {
  it("accepts every generated avatar URL", () => {
    for (const s of AVATAR_STYLES) {
      for (const seed of AVATAR_SEEDS) {
        expect(isAllowedAvatarUrl(buildAvatarUrl(s.id, seed))).toBe(true);
      }
    }
  });

  it("rejects other hosts, styles and unsafe seeds", () => {
    expect(isAllowedAvatarUrl("https://evil.com/a.png")).toBe(false);
    expect(isAllowedAvatarUrl("https://api.dicebear.com.evil.com/9.x/thumbs/svg?seed=a")).toBe(false);
    expect(isAllowedAvatarUrl("https://api.dicebear.com/9.x/unknown/svg?seed=a")).toBe(false);
    expect(isAllowedAvatarUrl("https://api.dicebear.com/9.x/thumbs/svg?seed=a&x=1")).toBe(false);
    expect(isAllowedAvatarUrl("javascript:alert(1)")).toBe(false);
  });
});
