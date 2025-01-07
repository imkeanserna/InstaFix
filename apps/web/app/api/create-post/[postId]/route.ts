import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { updatePost } from "../../_action/posts/getPosts";

export const runtime = "edge";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let type, userId, data;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      type = formData.get('type') as string;
      userId = formData.get('userId') as string;
      data = {
        media: formData.getAll('files') as File[]
      };
    } else {
      const body: any = await request.json();
      type = body.type;
      userId = body.userId;
      data = body.data;
    }

    if (!userId) {
      return errorResponse('User Id is required', undefined, 400);
    }

    if (!params?.postId) {
      return errorResponse('Post Id is required', undefined, 400);
    }

    if (!type) {
      return errorResponse('Update type is required', undefined, 400);
    }

    const result = await updatePost({
      type,
      data,
      userId,
      postId: params?.postId
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
