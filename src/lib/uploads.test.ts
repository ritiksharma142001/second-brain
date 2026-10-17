import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { sanitizeHTML } from "./security";
import { UPLOAD_DIR, altFromFilename, detectImageType, processImage, resolveUploadPath } from "./uploads";

const png = () => sharp({ create: { width: 40, height: 30, channels: 3, background: "#f60" } }).png().toBuffer();

describe("detectImageType", () => {
  it("recognises images by their bytes", async () => {
    expect(detectImageType(await png())).toBe("png");
    expect(detectImageType(await sharp({ create: { width: 8, height: 8, channels: 3, background: "#000" } }).jpeg().toBuffer())).toBe("jpeg");
    expect(detectImageType(await sharp({ create: { width: 8, height: 8, channels: 3, background: "#000" } }).webp().toBuffer())).toBe("webp");
  });

  it("rejects SVG, HTML and plain text, whatever they claim to be", () => {
    expect(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBeNull();
    expect(detectImageType(Buffer.from("<html><script>alert(1)</script></html>"))).toBeNull();
    expect(detectImageType(Buffer.from("hello world"))).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });
});

describe("processImage", () => {
  it("re-encodes to WebP and caps the size", async () => {
    const big = await sharp({ create: { width: 4000, height: 1000, channels: 3, background: "#09f" } }).jpeg().toBuffer();
    const out = await processImage(big, "jpeg");
    expect(detectImageType(out.data)).toBe("webp");
    expect(out.width).toBe(2200);
    expect(out.height).toBe(550);
  });

  it("strips EXIF metadata such as GPS coordinates", async () => {
    const withExif = await sharp({ create: { width: 20, height: 20, channels: 3, background: "#fff" } })
      .jpeg()
      .withExif({ IFD3: { GPSLatitudeRef: "N", GPSLatitude: "35/1 40/1 0/1" } })
      .toBuffer();
    expect((await sharp(withExif).metadata()).exif).toBeDefined();

    const out = await processImage(withExif, "jpeg");
    expect((await sharp(out.data).metadata()).exif).toBeUndefined();
  });
});

describe("processImage (animated)", () => {
  it("keeps animations and reports the height of one frame", async () => {
    // 60x40, three frames (red, green, blue)
    const gif = Buffer.from("R0lGODlhPAAoAIEAAP8AAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQACgAAACwAAAAAPAAoAAAIUAABCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1K1GZAACH5BAEKAAEALAAAAAA8ACgAgQD/AAAAAAAAAAAAAAhQAAEIHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUrUZkAAIfkEAQoAAQAsAAAAADwAKACBAAD/AAAAAAAAAAAACFAAAQgcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodStRmQAA7", "base64");
    expect((await sharp(gif, { animated: true }).metadata()).pages).toBe(3); // the fixture really is animated

    const out = await processImage(gif, "gif");
    expect(out.width).toBe(60);
    expect(out.height).toBe(40);
    expect((await sharp(out.data, { animated: true }).metadata()).pages).toBe(3);
  });
});

describe("resolveUploadPath", () => {
  it("maps normal upload keys inside UPLOAD_DIR", () => {
    expect(resolveUploadPath(["2026", "10", "abc123.webp"])).toBe(path.join(UPLOAD_DIR, "2026", "10", "abc123.webp"));
  });

  it("blocks traversal, odd characters and non-webp files", () => {
    expect(resolveUploadPath(["..", "..", "etc", "passwd.webp"])).toBeNull();
    expect(resolveUploadPath(["2026", "..%2F..", "x.webp"])).toBeNull();
    expect(resolveUploadPath(["2026", "10", "a.svg"])).toBeNull();
    expect(resolveUploadPath(["2026", "10", "a b.webp"])).toBeNull();
    expect(resolveUploadPath([])).toBeNull();
  });
});

describe("helpers", () => {
  it("builds readable alt text", () => {
    expect(altFromFilename("IMG_1234_sunset-beach.JPG")).toBe("IMG 1234 sunset beach");
  });

  it("the sanitizer keeps our own /uploads images and still strips dangerous ones", () => {
    expect(sanitizeHTML('<img src="/uploads/2026/10/abc.webp" alt="Beach">')).toContain('src="/uploads/2026/10/abc.webp"');
    expect(sanitizeHTML('<img src="//evil.com/x.png">')).not.toContain("evil.com");
    expect(sanitizeHTML('<img src="javascript:alert(1)">')).not.toContain("javascript");
  });
});
