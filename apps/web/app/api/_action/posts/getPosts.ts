import { prisma } from '@/server/index';
import { Post } from '@prisma/client/edge'

export const runtime = 'edge'

export async function getPostsByProfession(professions: string[]): Promise<{ posts: Post[] }> {
  console.log(professions);
  try {
    const posts: Post[] = await prisma.post.findMany({
      where: {
        tags: {
          some: {
            subcategory: {
              name: {
                in: professions
              }
            },
          },
        },
      },
      include: {
        tags: {
          include: {
            subcategory: true,
          },
        },
        freelancer: true,
      },
    });

    return { posts };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}
