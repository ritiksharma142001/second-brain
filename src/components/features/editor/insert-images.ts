import type { Editor } from "@tiptap/react";

export interface InsertableImage {
  url: string;
  alt: string;
}

/**
 * Inserts images into the editor without overwriting anything.
 *
 * By default Tiptap replaces the current selection, and right after inserting an image that
 * image is the selection, so a second insert would swallow the first. Inserting at the end
 * of the selection (or at an explicit position, e.g. a drop point) avoids that.
 */
export function insertImages(
  editor: Editor,
  images: InsertableImage[],
  pos?: number,
) {
  if (images.length === 0) return;
  const at = pos ?? editor.state.selection.to;

  editor
    .chain()
    .focus()
    .insertContentAt(
      at,
      images.map((img) => ({
        type: "image",
        attrs: { src: img.url, alt: img.alt },
      })),
    )
    .run();
}
