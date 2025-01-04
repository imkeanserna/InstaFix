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
  locationId?: string;
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
