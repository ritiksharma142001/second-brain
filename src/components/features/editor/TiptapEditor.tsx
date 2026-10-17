"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Toolbar } from "./Toolbar";
import { insertImages } from "./insert-images";
import { toast } from "@/lib/hooks/use-toast";
import { uploadImages, type UploadedImage } from "@/lib/upload-client";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  /** Lets a parent insert content (e.g. from a photo panel). */
  editorRef?: MutableRefObject<Editor | null>;
  /** Called with every image uploaded through the toolbar, paste or drag-and-drop. */
  onImagesUploaded?: (images: UploadedImage[]) => void;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder,
  editorRef,
  onImagesUploaded,
}: TiptapEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  // Handlers are created before the editor exists, so they call through this ref.
  const uploadRef = useRef<(files: File[], pos?: number) => void>(() => {});

  const editor = useEditor({
    // Render on the client only: the page is server-rendered, and Tiptap warns about hydration mismatches otherwise.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing your amazing content...",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Table.configure({
        HTMLAttributes: {
          class: "border-collapse table-auto w-full",
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        HTMLAttributes: {
          class: "flex items-start gap-2",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-muted p-4 rounded-lg my-4 overflow-x-auto",
        },
      }),
    ],
    content,
    editorProps: {
      handlePaste: (_view, event) => {
        const images = Array.from(event.clipboardData?.files ?? []).filter(
          (f) => f.type.startsWith("image/"),
        );
        if (images.length === 0) return false;
        event.preventDefault();
        uploadRef.current(images);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false; // moving existing content around, not a file drop
        const images = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (images.length === 0) return false;
        event.preventDefault();
        const at = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })?.pos;
        uploadRef.current(images, at);
        return true;
      },
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert focus:outline-none min-h-[300px] max-w-none p-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Expose the editor to the parent once it exists.
  useEffect(() => {
    if (editorRef) editorRef.current = editor;
  }, [editor, editorRef]);

  const upload = async (files: File[], pos?: number) => {
    if (!editor || files.length === 0) return;
    setIsUploading(true);
    try {
      const { files: uploaded, errors } = await uploadImages(files);

      if (uploaded.length > 0) {
        insertImages(editor, uploaded, pos);
        onImagesUploaded?.(uploaded);
      }
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
      setIsUploading(false);
    }
  };

  // Keep the handlers created before the editor existed pointing at the latest function.
  useEffect(() => {
    uploadRef.current = upload;
  });

  return (
    <div className="w-full rounded-lg border">
      <Toolbar
        editor={editor}
        onUploadImages={(files) => uploadRef.current(files)}
        isUploading={isUploading}
      />
      <EditorContent editor={editor} />
    </div>
  );
}
