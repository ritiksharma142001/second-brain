"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";
import {
  ACCEPTED_IMAGE_TYPES,
  CLIENT_UPLOAD_LIMITS,
  uploadImages,
  type UploadedImage,
} from "@/lib/upload-client";
import { cn } from "@/lib/utils";

interface PhotoPanelProps {
  photos: UploadedImage[];
  coverUrl: string;
  onUploaded: (images: UploadedImage[]) => void;
  onInsert: (image: UploadedImage) => void;
  onUseAsCover: (image: UploadedImage) => void;
  onRemove: (url: string) => void;
}

/** Multi-photo uploader: drop or pick several images, then insert them or use one as the cover. */
export function PhotoPanel({
  photos,
  coverUrl,
  onUploaded,
  onInsert,
  onUseAsCover,
  onRemove,
}: PhotoPanelProps) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<number>(0); // number of files being uploaded
  const [dragging, setDragging] = useState(false);

  const upload = async (files: File[]) => {
    if (files.length === 0) return;
    setBusy(files.length);
    try {
      const { files: uploaded, errors } = await uploadImages(files);
      if (uploaded.length > 0) onUploaded(uploaded);
      if (errors.length > 0) {
        toast({
          title: `${errors.length} photo${errors.length === 1 ? "" : "s"} skipped`,
          description: errors.map((e) => `${e.name}: ${e.error}`).join("\n"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(0);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES}
        data-photo-input
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          void upload(files);
        }}
      />

      <button
        type="button"
        disabled={busy > 0}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors",
          "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging
            ? "border-highlight bg-accent"
            : "border-border bg-background/40",
          busy > 0 && "cursor-wait opacity-70",
        )}
      >
        {busy > 0 ? (
          <Loader2 className="h-6 w-6 animate-spin text-highlight" />
        ) : (
          <ImagePlus className="h-6 w-6 text-highlight" />
        )}
        <span className="font-medium">
          {busy > 0
            ? `Uploading ${busy} photo${busy === 1 ? "" : "s"}...`
            : "Add photos"}
        </span>
        <span className="text-xs text-muted-foreground">
          Drop or choose up to {CLIENT_UPLOAD_LIMITS.maxFiles} at once · JPEG,
          PNG, GIF, WebP · max 8 MB each
        </span>
      </button>

      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3">
          {photos.map((photo) => (
            <li
              key={photo.url}
              className="group relative overflow-hidden rounded-lg border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.alt}
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
              {photo.url === coverUrl && (
                <span className="sticker absolute left-1.5 top-1.5 !py-0 text-[0.65rem]">
                  cover
                </span>
              )}
              <button
                type="button"
                aria-label={`Remove ${photo.alt || "photo"} from this list`}
                title="Remove from this list (the file stays in any post that uses it)"
                onClick={() => onRemove(photo.url)}
                className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-1 opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-6">
                <Button
                  type="button"
                  size="sm"
                  className="h-7 flex-1 px-2 text-xs"
                  onClick={() => onInsert(photo)}
                >
                  Insert
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-7 flex-1 px-2 text-xs"
                  onClick={() => onUseAsCover(photo)}
                  disabled={photo.url === coverUrl}
                >
                  Cover
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
