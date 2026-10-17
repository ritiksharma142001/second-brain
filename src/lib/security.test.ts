import { describe, expect, it } from "vitest";
import { sanitizeHTML } from "./security";

describe("sanitizeHTML", () => {
  it("removes scripts, inline handlers and iframes", () => {
    const out = sanitizeHTML(
      '<p onclick="x()">Hi</p><script>alert(1)</script><img src="https://a.com/i.png" onerror="alert(1)"><iframe src="//evil"></iframe>'
    );
    expect(out).not.toMatch(/script|onclick|onerror|iframe/i);
    expect(out).toContain("<p>Hi</p>");
  });

  it("blocks javascript: and data: URLs", () => {
    expect(sanitizeHTML('<a href="javascript:alert(1)">x</a>')).not.toContain("javascript:");
    expect(sanitizeHTML('<img src="data:text/html;base64,AAAA">')).not.toContain("data:");
  });

  it("forces safe rel on links and keeps normal formatting", () => {
    const out = sanitizeHTML('<h2>T</h2><a href="https://ok.com" target="_blank">ok</a><pre class="hljs"><code class="language-js">a</code></pre>');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
    expect(out).toContain("<h2>T</h2>");
    expect(out).toContain('class="language-js"');
  });
});
