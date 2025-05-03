import { validatePostOwnership } from "@/app/api/_action/posts/getPosts";
import { currentUser } from "@/lib";
import { errorResponse } from "@/lib/errorResponse";
import { User } from "next-auth";
import { prisma } from '@/server/index';
import { NextRequest, NextResponse } from "next/server";
import { UpdatePostByUserData, UpdatePostData } from "@repo/types";
import { PostUpdateHandlers } from "@/app/api/_action/posts/updateHandlers";

export const runtime = "edge";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const user: User | undefined = await currentUser();

    console.log("UPDATE POST")
    if (!user || !user?.id) return errorResponse('User Id is required', undefined, 400);

    if (!params?.postId) {
      return errorResponse('Post Id is required', undefined, 400);
    }

    console.log("POST ID", params?.postId)

    const existingPost = await validatePostOwnership(params?.postId, user.id);

    // Determine the content type and parse accordingly
    const contentType = request.headers.get('content-type') || '';
    let requestData: UpdatePostByUserData;

    if (contentType.includes('multipart/form-data')) {
      // Handle form data (for file uploads)
      const formData = await request.formData();

      // Extract JSON data from form fields
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
          requestData.media = { files: [], coverPhotoIndex: -1 }; // Added coverPhotoIndex
        } else if (!requestData.media.files) {
          requestData.media.files = [];
          // Make sure coverPhotoIndex exists
          if (requestData.media.coverPhotoIndex === undefined) {
            requestData.media.coverPhotoIndex = -1;
          }
        }

        // Convert File objects to your application's expected format
        // This depends on how your media handler expects files
        requestData.media.files = files as File[];
      }
    } else {
      // Handle JSON content type
      requestData = await request.json();
    }

    console.log("REQUEST DATA", requestData)

    // Check which parts of the post are being updated and call the corresponding handlers
    let updatedPost = null;

    // Create an array to track which updates were successful
    const updateResults: { field: string, success: boolean, error?: string }[] = [];

    // Update basic info if provided
    if (requestData.basicInfo) {
      try {
        updatedPost = await PostUpdateHandlers.updateBasicInfo(params.postId, requestData.basicInfo);
        updateResults.push({ field: 'basicInfo', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'basicInfo', success: false, error: errorMessage });
      }
    }

    // Update tags if provided
    if (requestData.tags && requestData.tags.tags.length > 0) {
      try {
        updatedPost = await PostUpdateHandlers.updateTags(params.postId, requestData.tags);
        updateResults.push({ field: 'tags', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'tags', success: false, error: errorMessage });
      }
    }

    // Update service engagement if provided
    if (requestData.serviceEngagement && requestData.serviceEngagement.serviceEngagement.length > 0) {
      try {
        updatedPost = await PostUpdateHandlers.updateServiceEngagement(params.postId, requestData.serviceEngagement);
        updateResults.push({ field: 'serviceEngagement', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'serviceEngagement', success: false, error: errorMessage });
      }
    }

    // Update media if provided
    if (requestData.media && (requestData.media.files?.length > 0 || requestData.media.coverPhotoIndex !== undefined)) {
      try {
        updatedPost = await PostUpdateHandlers.updatePostImages(params.postId, requestData.media);
        updateResults.push({ field: 'media', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'media', success: false, error: errorMessage });
      }
    }

    // Handle image deletion if provided
    if (requestData.deleteImages && requestData.deleteImages.imageIds?.length > 0) {
      try {
        updatedPost = await PostUpdateHandlers.deletePostImages(params.postId, requestData.deleteImages);
        updateResults.push({ field: 'deleteImages', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'deleteImages', success: false, error: errorMessage });
      }
    }

    // Update location if provided
    if (requestData.location) {
      try {
        updatedPost = await PostUpdateHandlers.updateLocation(params.postId, requestData.location);
        updateResults.push({ field: 'location', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'location', success: false, error: errorMessage });
      }
    }

    // Update pricing if provided
    if (requestData.pricing) {
      try {
        updatedPost = await PostUpdateHandlers.updatePricing(params.postId, requestData.pricing);
        updateResults.push({ field: 'pricing', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'pricing', success: false, error: errorMessage });
      }
    }

    // Check if any updates were performed
    if (updateResults.length === 0) {
      console.log('No updates performed');
      return errorResponse('No valid update data provided', undefined, 400);
    }

    // Get the final updated post with all relations
    const finalUpdatedPost = await prisma.post.findUnique({
      where: { id: params.postId },
      include: {
        tags: {
          include: {
            subcategory: true
          }
        },
        serviceEngagement: true,
        media: true,
        location: true
      }
    });

    // Return the updated post
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
