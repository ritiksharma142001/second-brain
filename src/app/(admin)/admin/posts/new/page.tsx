import { PostForm } from "@/components/features/editor/PostForm";

export const metadata = { title: "New post" };

export default function NewPostPage() {
  return <PostForm basePath="/admin/posts" />;
}
