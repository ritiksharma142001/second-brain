import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import sharp from "sharp";

/**
 * Uploads go to Vercel Blob when a Blob store is connected (it sets
 * BLOB_READ_WRITE_TOKEN), and to UPLOAD_DIR on disk otherwise.
 */
export const blobStorageEnabled = () =>
  Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

/** Where uploaded images live on disk. Mount a persistent volume here in production. */
export const UPLOAD_DIR = path.resolve(
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"),
);

export const UPLOAD_LIMITS = {
  maxFiles: 10,
  maxFileBytes: 8 * 1024 * 1024,
  maxRequestBytes: 40 * 1024 * 1024,
  /** Longest side after resizing. */
  maxDimension: 2200,
} as const;

export type ImageKind = "jpeg" | "png" | "gif" | "webp";

/**
 * Identifies an image from its first bytes. The file name and the browser-supplied
 * MIME type are never trusted. SVG is deliberately unsupported: it can carry scripts.
 */
export function detectImageType(bytes: Uint8Array): ImageKind | null {
  const startsWith = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (startsWith(0xff, 0xd8, 0xff)) return "jpeg";
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (startsWith(0x47, 0x49, 0x46, 0x38)) return "gif"; // "GIF8"
  if (
    startsWith(0x52, 0x49, 0x46, 0x46) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp"; // "RIFF....WEBP"
  }
  return null;
}

export interface ProcessedImage {
  data: Buffer;
  width: number;
  height: number;
}

/**
 * Re-encodes to WebP. This auto-rotates from EXIF and then drops all metadata
 * (camera info, and GPS coordinates in particular), and caps the dimensions.
 */
export async function processImage(
  input: Buffer,
  kind: ImageKind,
): Promise<ProcessedImage> {
  const animated = kind === "gif" || kind === "webp";
  const { data, info } = await sharp(input, {
    animated,
    limitInputPixels: 60_000_000,
  })
    .rotate()
    .resize({
      width: UPLOAD_LIMITS.maxDimension,
      height: UPLOAD_LIMITS.maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  // For animated images, `info.height` covers every frame stacked up. Reading the file back
  // without the animation flag gives the height of a single frame.
  const meta = await sharp(data).metadata();
  return { data, width: info.width, height: meta.height ?? info.height };
}

export interface SavedUpload {
  /** Storage key, e.g. 2026/10/Ab3dE....webp (relative to UPLOAD_DIR on disk) */
  key: string;
  /** Public URL: /uploads/... on disk, or the Vercel Blob URL */
  url: string;
}

export async function saveUpload(data: Buffer): Promise<SavedUpload> {
  const now = new Date();
  const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const key = `${folder}/${nanoid(16).replace(/[^A-Za-z0-9]/g, "x")}.webp`;

  if (blobStorageEnabled()) {
    // Names are random and never reused, so the file can be cached for a year.
    const blob = await put(`uploads/${key}`, data, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    return { key, url: blob.url };
  }

  // Serverless hosts (e.g. Vercel) have no lasting disk: files written there vanish.
  if (process.env.VERCEL) {
    throw new Error(
      "Image storage isn't configured: connect a Vercel Blob store to this project.",
    );
  }

  await mkdir(path.join(UPLOAD_DIR, folder), { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, key), data, { flag: "wx" });
  return { key, url: `/uploads/${key}` };
}

const SAFE_SEGMENT = /^[A-Za-z0-9_-]+(\.webp)?$/;

/** Maps URL segments to a file path, or null for anything outside UPLOAD_DIR. */
export function resolveUploadPath(segments: string[]): string | null {
  if (segments.length === 0 || segments.length > 4) return null;
  if (!segments.every((s) => SAFE_SEGMENT.test(s))) return null;
  if (!segments[segments.length - 1].endsWith(".webp")) return null;

  const full = path.resolve(UPLOAD_DIR, ...segments);
  return full.startsWith(UPLOAD_DIR + path.sep) ? full : null;
}

/** A readable alt text from the original file name: "IMG_1234 sunset.jpg" -> "IMG 1234 sunset". */
export function altFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}
