import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { updatePost } from "../../_action/posts/getPosts";

export const runtime = "edge";

export async function PATCH(request: NextRequest) {
  try {
    const body: any = await request.json();
    const postId = request.nextUrl.searchParams.get('postId');
    const { userId, type, data } = body;

    if (!userId) {
      return errorResponse('User Id is required', undefined, 400);
    }

    if (!postId) {
      return errorResponse('Post Id is required', undefined, 400);
    }

    if (!type) {
      return errorResponse('Update type is required', undefined, 400);
    }

    const result = await updatePost({
      type,
      data,
      userId,
      postId
    });

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error processing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
