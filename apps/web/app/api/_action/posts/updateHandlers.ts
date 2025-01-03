import { prisma } from '@/server/index';
import { UpdatePostData } from './getPosts';

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
    return prisma.post.update({
      where: { id: postId },
      data: {
        media: {
          deleteMany: {},
          create: data.media.map(media => ({
            url: media.url,
            type: media.type
          }))
        }
      },
      include: {
        media: true
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
    return prisma.post.update({
      where: { id: postId },
      data: {
        locationId: data.locationId,
        serviceLocation: data.serviceLocation
      },
      include: {
        location: true
      }
    });
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
