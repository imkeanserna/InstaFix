import { prisma } from '@/server/index';

export const runtime = 'edge'

export async function updatePostWithTags(tags: string[], postId: string) {
  try {
    if (tags && Array.isArray(tags)) {
      // Delete existing tags for the post
      await prisma.postTag.deleteMany({
        where: {
          postId: postId,
        },
      });

      // Add new tags
      const newTags = await prisma.postTag.createMany({
        data: tags.map(subcategoryId => ({
          postId,
          subcategoryId
        }))
      });

      return newTags;
    }
    return [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}
