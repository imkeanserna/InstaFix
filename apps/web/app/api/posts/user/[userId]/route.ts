import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { PostWithUserInfo } from "@repo/types";
import { getPostByUser } from "@/app/api/_action/posts/getPosts";

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params?.userId;

    if (!userId) {
      return errorResponse('user id is required', undefined, 400);
    }

    const posts: PostWithUserInfo[] = await getPostByUser(userId);

    return NextResponse.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error getting post from user', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
