/**
 * Turns what someone typed into a safe link target, or returns an error message.
 * "example.com" becomes "https://example.com". javascript:, data: and similar are refused.
 */
export function normalizeLinkUrl(input: string): { url: string } | { error: string } {
  const value = input.trim();
  if (!value) return { error: "Please enter a link." };
  if (/\s/.test(value)) return { error: "Links can't contain spaces." };

  // Site-relative links and in-page anchors are fine.
  if (value.startsWith("/") && !value.startsWith("//")) return { url: value };
  if (value.startsWith("#")) return { url: value };

  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value)?.[1]?.toLowerCase();
  if (scheme) {
    if (scheme === "http" || scheme === "https" || scheme === "mailto") return { url: value };
    return { error: "Only http(s) and email links are allowed." };
  }

  // No scheme: treat as a web address if it looks like one.
  if (/^[^\s/]+\.[^\s/]{2,}(\/.*)?$/.test(value)) return { url: `https://${value}` };
  return { error: "That doesn't look like a web address." };
}
