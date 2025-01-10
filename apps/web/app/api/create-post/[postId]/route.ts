import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { getPostById, updatePost } from "../../_action/posts/getPosts";
import { currentUser } from "@/lib";
import { User } from "next-auth";

export const runtime = "edge";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const user: User | undefined = await currentUser();
    const contentType = request.headers.get('content-type') || '';
    let type, data;

    if (!user || !user?.id) return errorResponse('User Id is required', undefined, 400);

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      type = formData.get('type') as string;
      data = {
        files: formData.getAll('files') as File[],
        coverPhotoIndex: formData.get('coverPhotoIndex')
      };
    } else {
      const body: any = await request.json();
      type = body.type;
      data = body.data;
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
      userId: user?.id,
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

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const user: User | undefined = await currentUser();
  if (!user || !user?.id) {
    return errorResponse('User Id is required', undefined, 400);
  }

  if (!params?.postId) {
    return errorResponse('Post Id is required', undefined, 400);
  }

  try {
    const post = await getPostById(user.id, params?.postId);

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
