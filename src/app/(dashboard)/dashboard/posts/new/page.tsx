import { PostForm } from "@/components/features/editor/PostForm";

export const metadata = { title: "Write a post" };

export default function NewPostPage() {
  return <PostForm basePath="/dashboard/posts" />;
}
