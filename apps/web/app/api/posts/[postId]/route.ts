import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/server/index';
import { Prisma } from "@prisma/client/edge";

export const runtime = 'edge';

type PostInclude = {
  media: true;
  user: {
    select: {
      id: true;
      name: true;
      image: true;
      createdAt: true;
    }
  };
  tags: true;
  messagePosts: true;
  serviceEngagement: true;
  location: true;
  servicesIncluded: true;
  payments: true;
  reviews: true;
};

type PostWithIncludes = Prisma.PostGetPayload<{
  include: PostInclude;
}>;

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params?.postId;

    if (!postId) {
      return errorResponse('post id is required', undefined, 400);
    }
    const post: PostWithIncludes | null = await prisma.post.findUnique({
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
        tags: true,
        messagePosts: true,
        serviceEngagement: true,
        location: true,
        payments: true,
        reviews: true,
      },
    });

    if (!post) {
      return errorResponse('Post is not found', undefined, 404);
    }

    return NextResponse.json({
      success: true,
      data: post
    })
  } catch (error) {
    console.error('Error processing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
