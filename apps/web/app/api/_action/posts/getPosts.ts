import { prisma } from '@/server/index';
import { Category, Freelancer, Post, PostTag } from '@prisma/client/edge'
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

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

export async function updatePost(request: NextApiRequest) {
  try {
    const updates = request.body;
    const { id } = request.query;

    if (!id) throw new Error('Missing post id');

    const updatedPost = await prisma.post.update({
      where: { id: String(id) },
      data: updates,
    });
    return updatedPost;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function draftPost(userId: string) {
  try {
    const draftPost = await prisma.post.create({
      data: {
        freelancerId: userId,
      }
    });
    return draftPost;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}
