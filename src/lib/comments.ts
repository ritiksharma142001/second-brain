/** Replies nest at most this deep (top-level comment = depth 0). Shared by the API and the UI. */
export const MAX_COMMENT_DEPTH = 2;

export interface CommentData {
  id: string;
  content: string;
  createdAt: string | Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likedByMe: boolean;
  _count: {
    likes: number;
    replies: number;
  };
  replies?: CommentData[];
}

/** Total number of comments including every nested reply. */
export function countComments(comments: CommentData[]): number {
  return comments.reduce((total, c) => total + 1 + countComments(c.replies ?? []), 0);
}
