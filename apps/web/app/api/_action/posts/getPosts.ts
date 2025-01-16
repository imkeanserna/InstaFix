import { prisma } from '@/server/index';
import { Category, Freelancer, Post, PostTag, Prisma } from '@prisma/client/edge'
import { ResponseDataWithLocation, ResponseDataWithoutLocation, PostWithUserInfo } from "@repo/types";
import { PostUpdateHandlers } from './updateHandlers';
import { UpdatePostData, FilterOptions } from "@repo/types";
import { getLocationBasedQuery, processLocationBasedPosts } from './location';

export const runtime = 'edge'

export type PostWithRelations = Post & {
  freelancer: Freelancer;
  tags: (PostTag & {
    subcategory: {
      category: Category;
    };
  })[];
};

interface DensityConfig {
  minPosts: number;
  initialRadius: number;
  maxRadius: number;
  expansionStep: number;
}

export async function getPosts({
  page = 1,
  limit = 10,
  location,
  price,
  engagementType,
  minRating,
  targetAudience,
  servicesIncluded,
  categoryName,
  subcategoryName
}: FilterOptions): Promise<ResponseDataWithLocation | ResponseDataWithoutLocation> {
  try {
    const skip = (page - 1) * limit;

    // Build base query conditions
    const baseConditions = {
      ...(price?.type && { pricingType: price.type }),
      ...(price?.min !== undefined || price?.max !== undefined) && {
        OR: [
          {
            AND: [
              { pricingType: 'HOURLY' },
              { hourlyRate: { gte: price?.min, lte: price?.max } }
            ]
          },
          {
            AND: [
              { pricingType: 'FIXED_PRICE' },
              { fixedPrice: { gte: price?.min, lte: price?.max } }
            ]
          }
        ]
      },
      ...(engagementType && {
        serviceEngagement: {
          some: { engagementType }
        }
      }),
      ...(minRating && {
        averageRating: { gte: minRating }
      }),
      ...(targetAudience && {
        targetAudience
      }),
      ...(servicesIncluded?.length && {
        servicesIncluded: { hasEvery: servicesIncluded }
      }),
      ...(categoryName && {
        tags: {
          some: {
            subcategory: {
              category: { name: categoryName },
              ...(subcategoryName && { name: subcategoryName })
            }
          }
        }
      })
    };

    if (location?.latitude && location?.longitude) {
      // Density configuration
      const densityConfig: DensityConfig = {
        minPosts: 20,        // Minimum desired posts
        initialRadius: 5,    // Start with 5km radius
        maxRadius: 100,      // Never exceed 100km
        expansionStep: 5     // Increase by 5km each time
      };

      let currentRadius = densityConfig.initialRadius;
      let posts: PostWithUserInfo[] = [];
      let total = 0;
      let finalRadius = currentRadius;

      // Keep expanding radius until we have enough posts or hit max radius
      while (currentRadius <= densityConfig.maxRadius) {
        let where = getLocationBasedQuery(
          { ...location, radiusInKm: currentRadius },
          categoryName,
          subcategoryName
        );

        where = { ...where, ...baseConditions };

        // Count posts at current radius
        const postCount = await prisma.post.count({ where });

        // We found enough posts, get the actual data
        if (postCount > 0 && (postCount >= densityConfig.minPosts || currentRadius === densityConfig.maxRadius)) {
          [posts, total] = await Promise.all([
            prisma.post.findMany({
              skip,
              take: limit,
              include: {
                media: true,
                location: true,
                reviews: {
                  select: {
                    rating: true,
                    createdAt: true,
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                },
                user: {
                  select: {
                    name: true,
                    image: true,
                  }
                }
              },
              orderBy: [
                { averageRating: { sort: 'desc', nulls: 'last' } },
                { reviews: { _count: 'desc' } },
                { updatedAt: 'desc' },
                { createdAt: 'desc' }
              ],
              where
            }),
            Promise.resolve(postCount)
          ]);
          finalRadius = currentRadius;
          break;
        }

        currentRadius += densityConfig.expansionStep;
      }

      const processedPosts: (PostWithUserInfo & {
        distance: number
      })[] = processLocationBasedPosts(posts, location, finalRadius);

      return {
        posts: processedPosts,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page
        },
        searchRadius: finalRadius,
        density: total > 0 ? total / (Math.PI * finalRadius * finalRadius) : 0
      };
    } else {
      // Non-location based query remains unchanged
      const where = getNonLocationQuery(categoryName, subcategoryName) as Prisma.PostWhereInput;
      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          skip,
          take: limit,
          include: {
            media: true,
            location: true,
            reviews: {
              select: {
                rating: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          },
          orderBy: [
            { averageRating: { sort: 'desc', nulls: 'last' } },
            { reviews: { _count: 'desc' } },
            { updatedAt: 'desc' },
            { createdAt: 'desc' }
          ],
          where
        }),
        prisma.post.count({ where })
      ]);

      return {
        posts,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page
        }
      };
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

function getNonLocationQuery(categoryName?: string | null, subcategoryName?: string | null) {
  return {
    OR: [
      { serviceLocation: 'ONLINE' },
      { serviceLocation: 'HYBRID' }
    ],
    ...(categoryName && {
      tags: {
        some: {
          subcategory: {
            category: { name: categoryName },
            ...(subcategoryName && { name: subcategoryName })
          }
        }
      }
    })
  };
}

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
        media: true
      },
    });
    return post;
  } catch (error) {
    return null;
  }
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
