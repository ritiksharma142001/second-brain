import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, limitOrResponse, unauthorized } from "@/lib/api";
import {
  UPLOAD_LIMITS,
  altFromFilename,
  detectImageType,
  processImage,
  saveUpload,
} from "@/lib/uploads";

interface UploadedFile {
  url: string;
  name: string;
  alt: string;
  width: number;
  height: number;
  size: number;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();

  const limited = await limitOrResponse("upload", session.user.id);
  if (limited) return limited;

  // Refuse oversized requests before reading the body into memory.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > UPLOAD_LIMITS.maxRequestBytes) {
    return jsonError("That upload is too large. Try fewer or smaller photos.", 413);
  }

  let files: File[];
  try {
    const form = await request.formData();
    files = form.getAll("files").filter((v): v is File => v instanceof File);
  } catch {
    return jsonError("Could not read the upload.", 400);
  }

  if (files.length === 0) return jsonError("Choose at least one image.", 400);
  if (files.length > UPLOAD_LIMITS.maxFiles) {
    return jsonError(`You can upload up to ${UPLOAD_LIMITS.maxFiles} images at a time.`, 400);
  }

  const saved: UploadedFile[] = [];
  const errors: { name: string; error: string }[] = [];

  // One at a time keeps peak memory low while images are decoded and re-encoded.
  for (const file of files) {
    const name = file.name.slice(0, 120) || "image";
    try {
      if (file.size > UPLOAD_LIMITS.maxFileBytes) {
        errors.push({ name, error: `Larger than ${UPLOAD_LIMITS.maxFileBytes / 1024 / 1024} MB` });
        continue;
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      const kind = detectImageType(bytes);
      if (!kind) {
        errors.push({ name, error: "Not a supported image (use JPEG, PNG, GIF or WebP)" });
        continue;
      }

      const processed = await processImage(bytes, kind);
      const { key, url } = await saveUpload(processed.data);

      await prisma.media.create({
        data: { url, key, name, type: "image/webp", size: processed.data.length },
      });

      saved.push({
        url,
        name,
        alt: altFromFilename(name),
        width: processed.width,
        height: processed.height,
        size: processed.data.length,
      });
    } catch (error) {
      console.error("Upload failed for", name, error);
      errors.push({ name, error: "Could not process this image" });
    }
  }

  if (saved.length === 0) {
    return NextResponse.json({ error: errors[0]?.error ?? "Upload failed", files: [], errors }, { status: 400 });
  }
  return NextResponse.json({ files: saved, errors }, { status: 201 });
}
