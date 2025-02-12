import { Like } from "@prisma/client/edge";

type AddLikeResponse = {
  success: boolean;
  data: Like | null;
  error?: string;
}

export function hasUserLikedPost(likes: Like[], userId: string | undefined): boolean {
  if (!userId || !likes) return false;
  return likes.some(like => like.userId === userId);
}

export async function addLike({ postId }: { postId: string }) {
  try {
    if (!postId) {
      throw new Error('post id is required');
    }

    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/posts/${postId}/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to creating post');
    }

    const result: AddLikeResponse = await response.json();
    return result.data;
  } catch (error) {
    throw error;
  }
}
