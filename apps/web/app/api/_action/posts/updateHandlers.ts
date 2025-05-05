import { prisma } from '@/server/index';
import { PostMedia, PostWithUserInfo, UpdatePostByUserData, UpdatePostData } from '@repo/types';
import { findOrCreateLocation } from './location';
import { deleteFilesFromR2, uploadMultipleFiles } from '@repo/services/src/storage/mediaUpload';
import { Media, Post } from '@prisma/client/edge';
import { getCurrentMediaUrls } from '../media/media';
import {
  hasBasicInfoChanges,
  hasLocationChanges,
  hasMediaChanges,
  hasPricingChanges,
  hasServiceEngagementChanged,
  hasTagsChanged
} from '../helper/updatePostUtils';

export const runtime = 'edge'

export class PostUpdateHandlers {
  static async processPostUpdates(
    postId: string,
    requestData: UpdatePostByUserData,
    existingPost: PostWithUserInfo
  ) {
    let updatedPost = null;
    const updateResults: { field: string, success: boolean, error?: string }[] = [];

    // Update basic info if provided
    if (requestData.basicInfo && hasBasicInfoChanges(requestData.basicInfo, existingPost)) {
      try {
        updatedPost = await this.updateBasicInfo(postId, requestData.basicInfo);
        updateResults.push({ field: 'basicInfo', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'basicInfo', success: false, error: errorMessage });
      }
    }

    // Update tags if provided
    if (requestData.tags && requestData.tags.tags.length > 0 && hasTagsChanged(requestData.tags.tags, existingPost.tags!)) {
      try {
        updatedPost = await this.updateTags(postId, requestData.tags);
        updateResults.push({ field: 'tags', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'tags', success: false, error: errorMessage });
      }
    }

    // Update service engagement if provided
    if (requestData.serviceEngagement &&
      requestData.serviceEngagement.serviceEngagement.length > 0 &&
      hasServiceEngagementChanged(requestData.serviceEngagement.serviceEngagement, existingPost.serviceEngagement!)
    ) {
      try {
        updatedPost = await this.updateServiceEngagement(postId, requestData.serviceEngagement);
        updateResults.push({ field: 'serviceEngagement', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'serviceEngagement', success: false, error: errorMessage });
      }
    }

    // Update media if provided
    if (requestData.media && hasMediaChanges(requestData.media, existingPost)) {
      try {
        updatedPost = await this.updatePostImages(postId, requestData.media);
        updateResults.push({ field: 'media', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'media', success: false, error: errorMessage });
      }
    }

    // Handle image deletion if provided
    if (requestData.deleteImages && requestData.deleteImages.imageIds?.length > 0) {
      try {
        updatedPost = await this.deletePostImages(postId, requestData.deleteImages);
        updateResults.push({ field: 'deleteImages', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'deleteImages', success: false, error: errorMessage });
      }
    }

    // Update location if provided
    if (requestData.location && hasLocationChanges(requestData.location, existingPost)) {
      try {
        updatedPost = await this.updateLocation(postId, requestData.location);
        updateResults.push({ field: 'location', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'location', success: false, error: errorMessage });
      }
    }

    // Update pricing if provided
    if (requestData.pricing && hasPricingChanges(requestData.pricing, existingPost)) {
      try {
        updatedPost = await this.updatePricing(postId, requestData.pricing);
        updateResults.push({ field: 'pricing', success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ field: 'pricing', success: false, error: errorMessage });
      }
    }

    if (updateResults.length === 0) {
      throw new Error('No valid update data provided');
    }

    // Final updated post with all relations
    const finalUpdatedPost: Post | null = await prisma.post.findUnique({
      where: { id: postId }
    });

    return {
      finalUpdatedPost,
      updateResults
    };
  }

  static async updateTags(postId: string, data: UpdatePostData['tags']) {
    const tagsToCreate = data.tags.map(tagData => ({
      subcategoryId: tagData.subcategoryId
    }));

    return prisma.post.update({
      where: { id: postId },
      data: {
        tags: {
          deleteMany: {},
          create: tagsToCreate
        }
      },
      include: {
        tags: {
          include: {
            subcategory: true
          }
        }
      }
    });
  }

  static async updateServiceEngagement(
    postId: string,
    data: UpdatePostData['serviceEngagement']
  ) {
    return prisma.post.update({
      where: { id: postId },
      data: {
        serviceEngagement: {
          deleteMany: {},
          create: data.serviceEngagement.map(engagement => ({
            engagementType: engagement.engagementType,
            customDetails: engagement?.customDetails
          }))
        }
      },
      include: {
        serviceEngagement: true
      }
    });
  }

  static async updateMedia(
    postId: string,
    data: UpdatePostData['media']
  ) {
    if (!data.files?.length && !data.coverPhotoIndex) {
      throw new Error('No media files provided');
    }
    return await prisma.$transaction(async (tx) => {
      try {
        // Get current media URLs before updating
        const currentMediaUrls: Media['url'][] = await getCurrentMediaUrls(postId);

        const uploadedMedia: PostMedia[] = await uploadMultipleFiles(data.files);

        const updatedPost = await tx.post.update({
          where: { id: postId },
          data: {
            media: {
              deleteMany: {},
              create: uploadedMedia.map(media => ({
                url: media.url,
                type: media.type
              }))
            },
            coverPhoto: uploadedMedia[data.coverPhotoIndex].url
          },
          include: {
            media: true
          }
        });

        // Delete old files from R2 after successful database update
        await deleteFilesFromR2(currentMediaUrls);

        return updatedPost;
      } catch (error) {
        console.error('Error updating post media:', error);
        throw error;
      }
    });
  }

  static async updatePostImages(
    postId: string,
    data: UpdatePostData['media']
  ) {
    if (!data.files?.length && data.coverPhotoIndex === undefined) {
      throw new Error('No media updates provided');
    }

    return await prisma.$transaction(async (tx) => {
      try {
        const existingMedia = await tx.media.findMany({
          where: { postId }
        });

        let uploadedMedia: PostMedia[] = [];
        if (data.files?.length) {
          uploadedMedia = await uploadMultipleFiles(data.files);
        }

        let coverPhotoUrl: string | undefined;

        // If uploading new files and coverPhotoIndex is specified
        if (uploadedMedia.length > 0 && data.coverPhotoIndex !== undefined &&
          data.coverPhotoIndex < uploadedMedia.length && data.coverPhotoIndex !== 0
        ) {
          coverPhotoUrl = uploadedMedia[data.coverPhotoIndex].url;
        }

        else if (data.files === undefined) {
          coverPhotoUrl = existingMedia[data.coverPhotoIndex].url;
        }

        // Update the post with new media while keeping existing media
        const updatedPost = await tx.post.update({
          where: { id: postId },
          data: {
            ...(coverPhotoUrl && { coverPhoto: coverPhotoUrl }),
            media: uploadedMedia.length > 0 ? {
              create: uploadedMedia.map(media => ({
                url: media.url,
                type: media.type
              }))
            } : undefined
          },
          include: {
            media: true
          }
        });

        return updatedPost;
      } catch (error) {
        console.error('Error updating post media:', error);
        throw error;
      }
    });
  }

  static async deletePostImages(
    postId: string,
    data: { imageIds: string[] }
  ) {
    if (!data.imageIds?.length) {
      throw new Error('No image IDs provided for deletion');
    }

    return await prisma.$transaction(async (tx) => {
      try {
        const imagesToDelete = await tx.media.findMany({
          where: {
            id: { in: data.imageIds },
            postId: postId
          },
          select: {
            id: true,
            url: true
          }
        });

        if (imagesToDelete.length === 0) {
          throw new Error('No matching images found for deletion');
        }

        // Get the URLs to delete from R2
        const urlsToDelete = imagesToDelete.map(img => img.url);

        // Get the current post to check if we're deleting the cover photo
        const currentPost = await tx.post.findUnique({
          where: { id: postId },
          select: {
            coverPhoto: true,
            media: {
              select: {
                id: true,
                url: true
              }
            }
          }
        });

        if (!currentPost) {
          throw new Error('Post not found');
        }

        // Delete the specified media records from the database
        await tx.media.deleteMany({
          where: {
            id: { in: data.imageIds },
            postId: postId
          }
        });

        if (currentPost.coverPhoto) {
          // Check deleted the cover photo
          const deletedCoverPhoto = urlsToDelete.includes(currentPost.coverPhoto);

          if (deletedCoverPhoto) {
            const remainingMedia = currentPost.media.filter(
              media => !data.imageIds.includes(media.id)
            );

            await tx.post.update({
              where: { id: postId },
              data: {
                coverPhoto: remainingMedia.length > 0 ? remainingMedia[0].url : null
              }
            });
          }
        }

        await deleteFilesFromR2(urlsToDelete);

        return await tx.post.findUnique({
          where: { id: postId },
          include: {
            media: true
          }
        });
      } catch (error) {
        console.error('Error deleting post images:', error);
        throw error;
      }
    });
  }

  static async updateBasicInfo(postId: string, data: UpdatePostData['basicInfo']) {
    return prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        description: data.description,
        skills: data.skills,
        experience: data.experience,
        targetAudience: data.targetAudience,
        customDetails: data.customDetails,
        packageDetails: data.packageDetails,
        servicesIncluded: data.servicesIncluded,
        requestConfirmation: data.requestConfirmation
      }
    });
  }

  static async updateLocation(postId: string, data: UpdatePostData['location']) {
    try {
      let locationId = null;

      if (data.address) {
        const location = await findOrCreateLocation(data);
        locationId = location.id;
      }

      const post = await prisma.post.update({
        where: {
          id: postId
        },
        data: {
          serviceLocation: data.serviceLocation,
          locationId: locationId
        },
        include: {
          location: true,
        }
      });

      return post;
    } catch (error) {
      console.error('Error creating post with location:', error);
      throw error;
    }
  }

  static async updatePricing(postId: string, data: UpdatePostData['pricing']) {
    return prisma.post.update({
      where: { id: postId },
      data: {
        pricingType: data.pricingType,
        hourlyRate: data.hourlyRate,
        fixedPrice: data.fixedPrice
      }
    });
  }
}
