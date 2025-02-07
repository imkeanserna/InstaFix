import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/errorResponse";
import { prisma } from '@/server/index';
import { DynamicPostWithIncludes } from "@repo/types";

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params?.postId;
    if (!postId) {
      return errorResponse('post id is required', undefined, 400);
    }

    const post: DynamicPostWithIncludes | null = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
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
    console.error('Error processing post dynamic:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
