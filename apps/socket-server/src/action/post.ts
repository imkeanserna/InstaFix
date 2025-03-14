import { Post } from '@prisma/client/edge';
import { prisma } from '../db/index';

// export const runtime = 'edge'

export async function getPostById({ postId }: { postId: string }) {
  try {
    if (!postId) throw new Error('Post id is required');

    const post: Post | null = await prisma.post.findUnique({
      where: { id: postId }
    });
    return post;
  } catch (error) {
    console.error(error);
  }
}
