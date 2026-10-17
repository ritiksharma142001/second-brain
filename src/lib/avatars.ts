/**
 * Cartoon avatars, rendered by DiceBear (https://www.dicebear.com).
 * Only URLs built by `buildAvatarUrl` are accepted as a user's image, so users
 * cannot point their avatar at arbitrary hosts.
 */

export const AVATAR_STYLES = [
  { id: "lorelei", label: "Lorelei" },
  { id: "notionists", label: "Notionists" },
  { id: "open-peeps", label: "Open Peeps" },
  { id: "thumbs", label: "Thumbs" },
  { id: "bottts", label: "Robots" },
] as const;

export const AVATAR_SEEDS = [
  "Felix", "Aneka", "Mia", "Leo", "Zoe", "Max", "Luna", "Kai",
] as const;

const BASE = "https://api.dicebear.com/9.x";
const STYLE_IDS = AVATAR_STYLES.map((s) => s.id).join("|");
const AVATAR_URL_PATTERN = new RegExp(`^${BASE.replace(/[.]/g, "\\.")}/(${STYLE_IDS})/svg\\?seed=[A-Za-z0-9-]{1,32}$`);

export function buildAvatarUrl(style: string, seed: string) {
  return `${BASE}/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

export function isAllowedAvatarUrl(url: string) {
  return AVATAR_URL_PATTERN.test(url);
}
