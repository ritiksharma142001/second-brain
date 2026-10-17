import sanitize from "sanitize-html";

/**
 * Security utilities for sanitization and validation
 */

/**
 * Sanitize user-authored post HTML (stored XSS protection).
 * Allows the formatting the Tiptap editor produces and strips everything else.
 */
export function sanitizeHTML(html: string): string {
  return sanitize(html, {
    allowedTags: [
      "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "a", "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "code", "pre", "ul", "ol", "li", "img", "table", "thead", "tbody", "tr",
      "td", "th", "div", "span", "label", "input",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      code: ["class"],
      pre: ["class"],
      span: ["class"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      ul: ["data-type"],
      li: ["data-type", "data-checked"],
      input: ["type", "checked", "disabled"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    // Block "//host/path" URLs: they would load content from another site over the page's own protocol.
    allowProtocolRelative: false,
    allowedSchemesByTag: { img: ["http", "https"] },
    allowedClasses: { code: [/^language-/, /^hljs/], pre: [/^hljs/], span: [/^hljs/] },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer nofollow" },
      }),
      input: (tagName, attribs) => ({
        tagName,
        attribs: { type: "checkbox", disabled: "disabled", ...(attribs.checked !== undefined ? { checked: "checked" } : {}) },
      }),
    },
  });
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize user input (for comments, etc)
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove inline event handlers
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .slice(0, 10000); // Limit length
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}
