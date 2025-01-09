import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { draftPost } from "../_action/posts/getPosts";

export const runtime = "edge";

interface IRequestBody {
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<IRequestBody>;
    const { userId } = body;

    if (!userId) return errorResponse('User Id is required', undefined, 400);

    const post = await draftPost(userId);

    return NextResponse.json({
      success: true,
      data: {
        post: post
      }
    });
  } catch (error) {
    console.error('Error processing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
