"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  Table,
  CheckSquare,
  Code2,
} from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { usePrompt } from "@/components/ui/prompt-dialog";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/upload-client";
import { normalizeLinkUrl } from "@/lib/urls";
import { Separator } from "@/components/ui/separator";

interface ToolbarProps {
  editor: Editor | null;
  /** Called with the chosen image files (multiple allowed). */
  onUploadImages?: (files: File[]) => void;
  isUploading?: boolean;
}

export function Toolbar({ editor, onUploadImages, isUploading }: ToolbarProps) {
  const { prompt, dialog } = usePrompt();
  const fileInput = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  const addImageFromUrl = async () => {
    const url = await prompt({
      title: "Insert an image from the web",
      description: "To use your own photos, choose Upload photos instead.",
      label: "Image address",
      placeholder: "https://example.com/photo.jpg",
      confirmLabel: "Insert image",
      validate: (value) =>
        /^https?:\/\/\S+$/i.test(value)
          ? null
          : "Enter a full image address starting with http:// or https://",
    });
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = async () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const noSelection = editor.state.selection.empty;

    const input = await prompt({
      title: previous ? "Edit link" : "Add a link",
      description: previous
        ? "Clear the field to remove this link."
        : noSelection
          ? "Nothing is selected, so the address itself will be shown as the link text."
          : undefined,
      label: "Web address",
      placeholder: "example.com or https://...",
      defaultValue: previous ?? "",
      confirmLabel: "Save link",
      allowEmpty: !!previous,
      validate: (value) => {
        const result = normalizeLinkUrl(value);
        return "error" in result ? result.error : null;
      },
    });
    if (input === null) return; // cancelled

    const chain = editor.chain().focus().extendMarkRange("link");
    if (input === "") {
      chain.unsetLink().run();
      return;
    }
    const result = normalizeLinkUrl(input);
    if ("error" in result) return;

    if (noSelection && !previous) {
      chain
        .insertContent({
          type: "text",
          text: result.url,
          marks: [{ type: "link", attrs: { href: result.url } }],
        })
        .run();
    } else {
      chain.setLink({ href: result.url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b p-2">
      {dialog}
      <input
        ref={fileInput}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES}
        data-editor-photo-input
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = ""; // allow picking the same file again
          if (files.length > 0) onUploadImages?.(files);
        }}
      />
      {/* Text Formatting */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-muted" : ""}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-muted" : ""}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "bg-muted" : ""}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive("code") ? "bg-muted" : ""}
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Headings */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-muted" : ""}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-muted" : ""}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={editor.isActive("taskList") ? "bg-muted" : ""}
      >
        <CheckSquare className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Other */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "bg-muted" : ""}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive("codeBlock") ? "bg-muted" : ""}
      >
        <Code2 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Insert */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={setLink}
        title="Add or edit a link"
        aria-label="Add or edit a link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      {onUploadImages && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isUploading}
          onClick={() => fileInput.current?.click()}
          title="Upload photos (you can pick several)"
          aria-label="Upload photos"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addImageFromUrl}
        title="Insert an image from a web address"
        aria-label="Insert image from URL"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <Table className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Undo/Redo */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}
