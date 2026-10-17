import { PostForm } from "@/components/features/editor/PostForm";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostForm basePath="/admin/posts" postId={id} />;
}
