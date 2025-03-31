import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { draftPost } from "../_action/posts/getPosts";
import { currentUser } from "@/lib";
import { User } from "next-auth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const user: User | undefined = await currentUser();

    if (!user || !user?.id) return errorResponse('User Id is required', undefined, 400);

    const post = await draftPost(user.id);

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
