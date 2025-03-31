import { prisma } from '@/server/index';
import { PostMedia, UpdatePostData } from '@repo/types';
import { findOrCreateLocation } from './location';
import { deleteFilesFromR2, uploadMultipleFiles } from '@repo/services/src/storage/mediaUpload';
import { Media } from '@prisma/client/edge';
import { getCurrentMediaUrls } from '../media/media';

export const runtime = 'edge'

export class PostUpdateHandlers {
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
