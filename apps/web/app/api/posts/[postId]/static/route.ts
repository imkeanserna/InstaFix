import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/errorResponse";
import { prisma } from '@/server/index';
import { Post, Prisma } from "@prisma/client/edge";
import { getPostByUser } from "@/app/api/_action/posts/getPosts";
import { PostWithUserInfo, StaticPostWithIncludes } from "@repo/types";

// export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params?.postId;
    if (!postId) {
      return errorResponse('post id is required', undefined, 400);
    }

    const post: StaticPostWithIncludes | null = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        media: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            createdAt: true,
          }
        },
        tags: {
          include: {
            subcategory: {
              select: {
                name: true
              }
            }
          }
        },
        serviceEngagement: true,
        location: true,
      },
    });

    if (!post) {
      return errorResponse('Post is not found', undefined, 404);
    }

    let highlightsPosts: PostWithUserInfo[] = [];
    highlightsPosts = await getPostByUser(post.user.id);

    return NextResponse.json({
      success: true,
      data: {
        post: post,
        highlightsPosts: highlightsPosts,
      }
    })
  } catch (error) {
    console.error('Error processing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
