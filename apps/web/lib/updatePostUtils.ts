import { Post } from "@prisma/client/edge";
import { UpdatePostByUserData } from "@repo/types";

export interface UpdatePostParams extends UpdatePostByUserData {
  postId: string;
}

interface UpdatePostResponse {
  success: boolean;
  data: Post | null;
  updateResults: Array<{
    field: string;
    success: boolean;
    error?: string;
  }>;
  error?: string;
}

export async function updatePostByUser({
  postId,
  basicInfo,
  tags,
  serviceEngagement,
  media,
  location,
  pricing,
  deleteImages
}: UpdatePostParams) {
  try {
    if (!basicInfo && !tags && !serviceEngagement && !media && !location && !pricing) {
      throw new Error('No update data provided');
    }

    const updateData: Partial<UpdatePostByUserData> = {};

    if (basicInfo) updateData.basicInfo = basicInfo;
    if (tags) updateData.tags = tags;
    if (serviceEngagement) updateData.serviceEngagement = serviceEngagement;
    if (location) updateData.location = location;
    if (pricing) updateData.pricing = pricing;
    if (deleteImages) updateData.deleteImages = deleteImages;

    if (media && media.files && media.files.length > 0 || media.coverPhotoIndex !== undefined) {
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        ...updateData,
        media: {
          coverPhotoIndex: media.coverPhotoIndex !== undefined ? media.coverPhotoIndex : 0
        }
      }));

      media.files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/posts/${postId}/update`, {
        method: 'PATCH',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const result: UpdatePostResponse = await response.json();
      return result.data;
    } else {
      const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/posts/${postId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const result: UpdatePostResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get response from chat AI');
      }
      return result.data;
    }
  } catch (error) {
    return null;
  }
}
