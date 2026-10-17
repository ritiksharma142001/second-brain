import { readFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { resolveUploadPath } from "@/lib/uploads";

/** Serves uploaded images from UPLOAD_DIR (files added after the build are not part of /public). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const file = resolveUploadPath((await params).path);
  if (!file) return new NextResponse("Not found", { status: 404 });

  try {
    const data = await readFile(file);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        // File names are random and never reused, so they can be cached forever.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
