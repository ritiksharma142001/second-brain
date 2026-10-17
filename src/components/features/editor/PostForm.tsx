"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TiptapEditor } from "@/components/features/editor/TiptapEditor";
import { PhotoPanel } from "@/components/features/editor/PhotoPanel";
import { insertImages } from "@/components/features/editor/insert-images";
import { TagInput } from "@/components/features/editor/TagInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPost, updatePost } from "@/lib/actions/post";
import type { UploadedImage } from "@/lib/upload-client";
import { calculateReadingTime, generateSlug } from "@/lib/utils";

interface PostFormProps {
  /** Where the list of posts lives, e.g. /dashboard/posts or /admin/posts. */
  basePath: string;
  /** Set to edit an existing post; omit to write a new one. */
  postId?: string;
}

interface Option {
  id: string;
  name: string;
}

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background/60 px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/** One editor for writing and editing posts, used by both the dashboard and the admin area. */
export function PostForm({ basePath, postId }: PostFormProps) {
  const router = useRouter();
  const isEdit = !!postId;

  const [isFetching, setIsFetching] = useState(isEdit);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "SCHEDULED">(
    "DRAFT",
  );

  const editorRef = useRef<Editor | null>(null);
  // Photos uploaded during this editing session, ready to insert or use as the cover.
  const [photos, setPhotos] = useState<UploadedImage[]>([]);
  const addPhotos = (images: UploadedImage[]) =>
    setPhotos((current) => [
      ...images.filter((i) => !current.some((c) => c.url === i.url)),
      ...current,
    ]);

  const [categories, setCategories] = useState<Option[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  // Categories and existing tags for the pickers.
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Option[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch("/api/tags")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Option[]) =>
        setTagSuggestions(Array.isArray(data) ? data.map((t) => t.name) : []),
      )
      .catch(() => {});
  }, []);

  // Load the post when editing.
  useEffect(() => {
    if (!postId) return;
    fetch(`/api/posts/${postId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch post");
        return r.json();
      })
      .then((post) => {
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt || "");
        setContent(post.content);
        setCoverImage(post.coverImage || "");
        setCategoryId(post.categoryId || "");
        setTags((post.tags ?? []).map((t: { name: string }) => t.name));
        setStatus(post.status);
      })
      .catch(() => setError("Failed to load post"))
      .finally(() => setIsFetching(false));
  }, [postId]);

  const handleTitleChange = (value: string) => {
    // In create mode keep the slug in step with the title until it is edited by hand.
    if (!isEdit && (!slug || slug === generateSlug(title)))
      setSlug(generateSlug(value));
    setTitle(value);
  };

  const handleSubmit = async (newStatus: "DRAFT" | "PUBLISHED") => {
    setIsLoading(true);
    setError("");

    const payload = {
      title,
      slug: slug || generateSlug(title),
      excerpt,
      content,
      coverImage: coverImage || undefined,
      categoryId: categoryId || null,
      tags,
      status: newStatus,
    };

    try {
      const result = isEdit
        ? await updatePost({
            id: postId,
            ...payload,
            publishedAt:
              newStatus === "PUBLISHED" && status !== "PUBLISHED"
                ? new Date()
                : undefined,
          })
        : await createPost({
            ...payload,
            publishedAt: newStatus === "PUBLISHED" ? new Date() : undefined,
          });

      if (result.error) {
        setError(result.error);
      } else {
        router.push(basePath);
        router.refresh();
      }
    } catch {
      setError(isEdit ? "Failed to update post" : "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="py-24 text-center font-mono text-sm text-muted-foreground">
        loading post...
      </div>
    );
  }

  const canSubmit = !isLoading && !!title && !!content;
  const wasPublished = status === "PUBLISHED";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={basePath}>
            <ArrowLeft /> Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit post" : "Write a new post"}
        </h1>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="post-url-slug"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of the post"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your post content here..."
                  editorRef={editorRef}
                  onImagesUploaded={addPhotos}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={selectClass}
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Writing about a trip? Pick Travel.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags &amp; destinations</Label>
                <TagInput
                  id="tags"
                  value={tags}
                  onChange={setTags}
                  suggestions={tagSuggestions}
                />
                <p className="text-xs text-muted-foreground">
                  Add places too, like a country or city, so readers can find
                  them in search.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoPanel
                photos={photos}
                coverUrl={coverImage}
                onUploaded={addPhotos}
                onInsert={(img) =>
                  editorRef.current && insertImages(editorRef.current, [img])
                }
                onUseAsCover={(img) => setCoverImage(img.url)}
                onRemove={(url) =>
                  setPhotos((current) => current.filter((p) => p.url !== url))
                }
              />
              <p className="mt-3 text-xs text-muted-foreground">
                You can also drag photos straight into the editor, or paste
                them.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover image</Label>
                {coverImage && (
                  <div className="relative overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="aspect-video w-full object-cover"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="absolute right-2 top-2 h-7 px-2 text-xs"
                      onClick={() => setCoverImage("")}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                <Input
                  id="coverImage"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Pick one in Photos, or paste an image URL"
                />
              </div>
              {content && (
                <div className="text-sm text-muted-foreground">
                  Reading time: ~{calculateReadingTime(content)} min
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => handleSubmit("DRAFT")}
                variant="outline"
                className="w-full"
                disabled={!canSubmit}
              >
                {isLoading
                  ? "Saving..."
                  : wasPublished
                    ? "Move to drafts"
                    : "Save as draft"}
              </Button>
              <Button
                onClick={() => handleSubmit("PUBLISHED")}
                className="w-full"
                disabled={!canSubmit}
              >
                {isLoading
                  ? "Publishing..."
                  : wasPublished
                    ? "Update"
                    : "Publish now"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
