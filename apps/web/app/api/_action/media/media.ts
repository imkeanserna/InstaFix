import { prisma } from '@/server/index';

export const runtime = 'edge'

export async function getCurrentMediaUrls(postId: string): Promise<string[]> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      media: {
        select: { url: true }
      }
    }
  });

  return post?.media.map(media => media.url) || [];
}
