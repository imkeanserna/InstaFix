import { validatePostOwnership } from "@/app/api/_action/posts/getPosts";
import { currentUser } from "@/lib";
import { errorResponse } from "@/lib/errorResponse";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { PostWithUserInfo, UpdatePostByUserData } from "@repo/types";
import { PostUpdateHandlers } from "@/app/api/_action/posts/updateHandlers";

export const runtime = "edge";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const user: User | undefined = await currentUser();

    if (!user || !user?.id) return errorResponse('User Id is required', undefined, 400);

    if (!params?.postId) {
      return errorResponse('Post Id is required', undefined, 400);
    }

    const existingPost: PostWithUserInfo | null = await validatePostOwnership(params?.postId, user.id);
    const contentType = request.headers.get('content-type') || '';
    let requestData: UpdatePostByUserData;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const jsonData = formData.get('data');

      if (!jsonData || typeof jsonData !== 'string') {
        console.error('Missing or invalid JSON data in form submission');
        return errorResponse('Missing or invalid JSON data in form submission', undefined, 400);
      }

      requestData = JSON.parse(jsonData) as UpdatePostByUserData;

      // Handle file uploads if present
      if (formData.has('files')) {
        const files = formData.getAll('files');

        if (!requestData.media) {
          requestData.media = { files: [], coverPhotoIndex: -1 };
        } else if (!requestData.media.files) {
          requestData.media.files = [];
          if (requestData.media.coverPhotoIndex === undefined) {
            requestData.media.coverPhotoIndex = -1;
          }
        }

        // Convert File objects to your application's expected format
        requestData.media.files = files as File[];
      }
    } else {
      // Handle JSON content type
      requestData = await request.json();
    }

    const { finalUpdatedPost, updateResults } = await PostUpdateHandlers.processPostUpdates(
      params.postId,
      requestData,
      existingPost
    );

    return NextResponse.json({
      success: true,
      data: finalUpdatedPost,
      updateResults
    });
  } catch (error) {
    console.error('Error updating post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
