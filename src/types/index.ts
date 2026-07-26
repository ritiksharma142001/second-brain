import { Post, User, Comment, Category, Tag, Role, PostStatus } from "@prisma/client";

export type { Role, PostStatus };

export type PostWithRelations = Post & {
  author: User;
  category: Category | null;
  tags: Tag[];
  _count: {
    comments: number;
    bookmarks: number;
  };
};

export type CommentWithRelations = Comment & {
  user: User;
  replies: CommentWithRelations[];
  _count: {
    likes: number;
  };
  isLiked?: boolean;
};

export type UserWithStats = User & {
  _count: {
    posts: number;
    comments: number;
  };
};

export interface SearchParams {
  query?: string;
  category?: string;
  tag?: string;
  sort?: "latest" | "popular" | "trending";
  page?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  recentUsers: User[];
  recentPosts: PostWithRelations[];
  topPosts: PostWithRelations[];
}
