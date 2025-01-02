import { errorResponse } from "@/lib/errorResponse";
import { Post } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { updatePost } from "../../_action/posts/getPosts";

export const runtime = "edge";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Post>;
    const postId = request.nextUrl.searchParams.get('postId');
    const { userId } = body;

    if (!userId) {
      return errorResponse('User Id is required', undefined, 400);
    }

    if (!postId) {
      return errorResponse('Post Id is required', undefined, 400);
    }

    const post = await updatePost(request, postId);
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
