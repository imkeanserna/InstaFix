import { prisma } from '@/server/index';
import { Category, EngagementType, Freelancer, MediaType, Post, PostTag, PricingType, RequestConfirmationType, ServiceLocationType, ServicesIncluded, TargetAudience } from '@prisma/client/edge'
import { PostUpdateHandlers } from './updateHandlers';

export const runtime = 'edge'

export type PostWithRelations = Post & {
  freelancer: Freelancer;
  tags: (PostTag & {
    subcategory: {
      category: Category;
    };
  })[];
};

export async function getPostsByProfession(professions: string[]): Promise<{ posts: Post[] }> {
  try {
    const posts: Post[] = await prisma.post.findMany({
      where: {
        tags: {
          some: {
            subcategory: {
              name: {
                in: professions
              }
            },
          },
        },
      },
      include: {
        tags: {
          include: {
            subcategory: true,
          },
        },
        user: true,
      },
    });

    return { posts };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function getPostById(userId: string, postId: string) {
  if (!userId || !postId) {
    return null;
  }

  try {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: userId
      },
      include: {
        tags: {
          include: {
            subcategory: true,
          },
        },
        user: true,
      },
    });
    return post;
  } catch (error) {
    return null;
  }
}

export type PostBasicInfo = {
  title?: string;
  description?: string;
  skills?: string[];
  experience?: string;
  targetAudience?: TargetAudience;
  customDetails?: string;
  packageDetails?: string;
  servicesIncluded?: ServicesIncluded[];
  requestConfirmation?: RequestConfirmationType;
}

export type PostPricing = {
  pricingType?: PricingType;
  hourlyRate?: number;
  fixedPrice?: number;
}

export type PostLocation = {
  address: string;
  lat: number;
  lng: number;
  serviceLocation?: ServiceLocationType;
}

export type PostServiceEngagement = {
  id?: string;
  engagementType: EngagementType;
  customDetails?: string;
}

export type PostWithTag = {
  subcategoryId: string;
}

export type PostMedia = {
  url: string;
  type: MediaType;
}

export type UpdatePostData = {
  tags: { tags: PostWithTag[] };
  serviceEngagement: { serviceEngagement: PostServiceEngagement[] };
  basicInfo: PostBasicInfo;
  media: { media: PostMedia[] };
  location: PostLocation;
  pricing: PostPricing;
}

type HandlerType = {
  [K in keyof UpdatePostData]: (
    postId: string,
    data: UpdatePostData[K]
  ) => Promise<any>
};

export const UPDATE_HANDLERS: HandlerType = {
  tags: PostUpdateHandlers.updateTags,
  serviceEngagement: PostUpdateHandlers.updateServiceEngagement,
  basicInfo: PostUpdateHandlers.updateBasicInfo,
  pricing: PostUpdateHandlers.updatePricing,
  media: PostUpdateHandlers.updateMedia,
  location: PostUpdateHandlers.updateLocation,
} as const;

export async function updatePost<T extends keyof typeof UPDATE_HANDLERS>(
  request: {
    type: T;
    data: UpdatePostData[T];
    userId: string;
    postId: string;
  }
) {
  const { type, data, userId, postId } = request;

  await validatePostOwnership(postId, userId);

  return UPDATE_HANDLERS[type](postId, data);
}

export async function draftPost(userId: string) {
  try {
    if (!userId) throw new Error('Missing user id');

    const draftPost = await prisma.post.create({
      data: {
        userId: userId,
      }
    });
    return draftPost;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function validatePostOwnership(postId: string, userId: string) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      userId
    }
  });

  if (!post) {
    throw new Error('Post not found or unauthorized');
  }

  return post;
}

export async function getNearbyPosts({
  latitude,
  longitude,
  radiusInKm = 10,
  limit = 20
}: {
  latitude: number;
  longitude: number;
  radiusInKm?: number;
  limit?: number;
}) {
  // Convert kilometers to degrees (approximate)
  const degreeRadius = radiusInKm / 111;

  try {
    const nearbyPosts = await prisma.post.findMany({
      where: {
        location: {
          latitude: {
            gte: latitude - degreeRadius,
            lte: latitude + degreeRadius,
          },
          longitude: {
            gte: longitude - degreeRadius,
            lte: longitude + degreeRadius,
          },
        },
      },
      include: {
        location: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      take: limit,
    });

    // Calculate actual distances and sort
    const postsWithDistance = nearbyPosts.map(post => ({
      ...post,
      distance: calculateDistance(
        latitude,
        longitude,
        post.location!.latitude,
        post.location!.longitude
      ),
    }));

    return postsWithDistance.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error getting nearby posts:', error);
    throw error;
  }
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}
