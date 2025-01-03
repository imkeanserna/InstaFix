
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
