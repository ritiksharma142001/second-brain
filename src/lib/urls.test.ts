import { describe, expect, it } from "vitest";
import { normalizeLinkUrl } from "./urls";

describe("normalizeLinkUrl", () => {
  it("adds https to bare domains and keeps full URLs", () => {
    expect(normalizeLinkUrl("example.com")).toEqual({ url: "https://example.com" });
    expect(normalizeLinkUrl("www.example.com/trip?x=1")).toEqual({ url: "https://www.example.com/trip?x=1" });
    expect(normalizeLinkUrl("http://example.com")).toEqual({ url: "http://example.com" });
    expect(normalizeLinkUrl("mailto:me@example.com")).toEqual({ url: "mailto:me@example.com" });
  });

  it("allows site-relative links and anchors", () => {
    expect(normalizeLinkUrl("/blog/first-adventure")).toEqual({ url: "/blog/first-adventure" });
    expect(normalizeLinkUrl("#comments")).toEqual({ url: "#comments" });
  });

  it("refuses dangerous schemes, protocol-relative URLs, spaces and nonsense", () => {
    for (const bad of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,hi", "//evil.com", "not a link", "hello", ""]) {
      expect(normalizeLinkUrl(bad)).toHaveProperty("error");
    }
  });
});
