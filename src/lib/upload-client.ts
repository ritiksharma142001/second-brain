/** Browser-side helper for POST /api/upload. Limits mirror the server's (src/lib/uploads.ts). */

export interface UploadedImage {
  url: string;
  name: string;
  alt: string;
  width: number;
  height: number;
  size: number;
}

export interface UploadResult {
  files: UploadedImage[];
  errors: { name: string; error: string }[];
}

export const CLIENT_UPLOAD_LIMITS = {
  maxFiles: 10,
  maxFileBytes: 8 * 1024 * 1024,
} as const;
export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/gif,image/webp";

/** Uploads one or more images. Resolves with whatever succeeded plus a per-file error list. */
export async function uploadImages(input: File[]): Promise<UploadResult> {
  const errors: UploadResult["errors"] = [];
  const files: File[] = [];

  for (const file of input) {
    if (!file.type.startsWith("image/")) {
      errors.push({ name: file.name, error: "Not an image" });
    } else if (file.size > CLIENT_UPLOAD_LIMITS.maxFileBytes) {
      errors.push({
        name: file.name,
        error: `Larger than ${CLIENT_UPLOAD_LIMITS.maxFileBytes / 1024 / 1024} MB`,
      });
    } else if (files.length >= CLIENT_UPLOAD_LIMITS.maxFiles) {
      errors.push({
        name: file.name,
        error: `Only ${CLIENT_UPLOAD_LIMITS.maxFiles} images at a time`,
      });
    } else {
      files.push(file);
    }
  }
  if (files.length === 0) return { files: [], errors };

  const body = new FormData();
  files.forEach((file) => body.append("files", file));

  const response = await fetch("/api/upload", { method: "POST", body });
  const data = await response.json().catch(() => ({}));

  if (!response.ok && !data.files?.length) {
    throw new Error(data.error ?? "Upload failed. Please try again.");
  }
  return {
    files: data.files ?? [],
    errors: [...errors, ...(data.errors ?? [])],
  };
}
