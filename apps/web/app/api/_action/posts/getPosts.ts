import { prisma } from '@/server/index';
import { Category, Freelancer, Post, PostTag } from '@prisma/client/edge'
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

export async function updatePost(request: NextRequest, postId: string) {
  try {
    const body = request.body as Partial<Post>;
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: body.userId,
      }
    });

    if (!post) {
      throw new Error('Post not found or unauthorized');
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: postId
      },
      data: {
        ...body
      }
    });
    return updatedPost;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function draftPost(userId: string) {
  try {
    if (!userId) throw new Error('Missing user id');

    const draftPost = await prisma.post.create({
      data: {
        userId: userId,
      }
    });
    return draftPost;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}
