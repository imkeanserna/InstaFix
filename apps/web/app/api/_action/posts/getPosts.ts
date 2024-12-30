import { prisma } from '@/server/index';
import { Category, Freelancer, Post, PostTag } from '@prisma/client/edge'

export const runtime = 'edge'

export type PostWithRelations = Post & {
  freelancer: Freelancer;
  tags: (PostTag & {
    subcategory: {
      category: Category;
    };
  })[];
};

export async function getPostsByProfession(professions: string[]): Promise<{ posts: Post[] }> {
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
