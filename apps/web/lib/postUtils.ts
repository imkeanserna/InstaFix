import { currentUser } from "@/lib";
import { Post } from "@prisma/client/edge";

export const runtime = "edge";

type PostResponse = {
  success: boolean;
  data: {
    post: Post;
  };
  error?: string;
}

export async function draftPost() {
  const user = await currentUser();
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/create-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user?.id
      })
    });

    if (!response.ok) {
      throw new Error('Failed to creating post');
    }

    const result: PostResponse = await response.json();
    if (!result.success) {
      throw new Error("Failed to create post");
    }
    return result.data.post;
  } catch (error) {
    return null;
  }
}

type UpdatePost = {
  type: string;
  data: any;
  postId: string;
}

type UpdatePostResponse = {
  success: boolean;
  data: {
    post: any;
  };
  error?: string;
}

export async function updatePost({ type, data, postId }: UpdatePost) {
  const user = await currentUser();

  try {
    if (type === 'media' && data.media) {
      const formData = new FormData();

      formData.append('type', type);
      formData.append('userId', user?.id || '');

      data.media.forEach((file: File) => {
        formData.append('files', file);
      });

      const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/create-post/${postId}`, {
        method: 'PATCH',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const result: UpdatePostResponse = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get response from chat AI');
      }
      return result.data;
    } else {
      const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/create-post/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: type,
          data: data,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const result: UpdatePostResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get response from chat AI');
      }
      return result.data;
    }
  } catch (error) {
    return null;
  }
}
