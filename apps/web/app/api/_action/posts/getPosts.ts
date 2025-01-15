import { prisma } from '@/server/index';
import { Prisma } from '@prisma/client/edge';
import { Category, Freelancer, Post, PostTag } from '@prisma/client/edge'
import { PostUpdateHandlers } from './updateHandlers';
import { UpdatePostData } from "@repo/types";

export const runtime = 'edge'

export type PostWithRelations = Post & {
  freelancer: Freelancer;
  tags: (PostTag & {
    subcategory: {
      category: Category;
    };
  })[];
};

type GetSortedPostArgs = {
  page?: number;
  limit?: number;
  categoryName?: string | null;
  subcategoryName?: string | null;
  location?: {
    latitude: number;
    longitude: number;
    radiusInKm: number;
  } | null;
};

export async function getSortedPost({
  page = 1,
  limit = 10,
  categoryName,
  subcategoryName,
  location
}: GetSortedPostArgs) {
  try {
    const skip = (page - 1) * limit;

    let where: Prisma.PostWhereInput = {};

    if (location?.latitude && location?.longitude) {
      // If location is provided, show all service types within radius
      where = {
        ...where,
        location: {
          latitude: {
            gte: location.latitude - (location.radiusInKm / 111),
            lte: location.latitude + (location.radiusInKm / 111),
          },
          longitude: {
            gte: location.longitude - (location.radiusInKm / (111 * Math.cos(location.latitude * (Math.PI / 180)))),
            lte: location.longitude + (location.radiusInKm / (111 * Math.cos(location.latitude * (Math.PI / 180)))),
          },
        },
      };
    } else {
      // If no location provided, show only ONLINE and HYBRID services
      where = {
        ...where,
        OR: [
          { serviceLocation: 'ONLINE' },
          { serviceLocation: 'HYBRID' }
        ]
      };
    }

    // Add category filters
    if (categoryName) {
      where = {
        ...where,
        tags: {
          some: {
            subcategory: {
              category: {
                name: categoryName
              },
              ...(subcategoryName && { name: subcategoryName })
            }
          }
        }
      };
    }

    const orderBy: Prisma.PostOrderByWithRelationInput[] = [
      {
        averageRating: {
          sort: 'desc',
          nulls: 'last',
        },
      },
      {
        reviews: {
          _count: 'desc',
        },
      },
      {
        updatedAt: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ];

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      include: {
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
      orderBy,
      where
    });

    const total = await prisma.post.count({
      where
    });

    if (location?.latitude && location?.longitude) {
      const postsWithDistance = posts.map((post) => ({
        ...post,
        distance: post.location
          ? calculateDistance(
            location.latitude,
            location.longitude,
            post.location.latitude,
            post.location.longitude
          )
          : Infinity
      }));

      // Get maximum values for normalization
      const maxDistance = Math.max(...postsWithDistance.map(post => post.distance));
      const maxReviews = Math.max(...postsWithDistance.map(post => post.reviews.length));
      const latestUpdate = Math.max(...postsWithDistance.map(post => new Date(post.updatedAt).getTime()));
      const latestCreation = Math.max(...postsWithDistance.map(post => new Date(post.createdAt).getTime()));

      // Custom sorting function that combines all criteria
      const processedPosts = postsWithDistance.sort((a, b) => {
        // Normalize all values to 0-1 scale
        const ratingA = (a.averageRating ?? 0) / 5;
        const ratingB = (b.averageRating ?? 0) / 5;

        const distanceA = a.distance / maxDistance;
        const distanceB = b.distance / maxDistance;

        const reviewsA = maxReviews ? a.reviews.length / maxReviews : 0;
        const reviewsB = maxReviews ? b.reviews.length / maxReviews : 0;

        const updatedAtA = new Date(a.updatedAt).getTime() / latestUpdate;
        const updatedAtB = new Date(b.updatedAt).getTime() / latestUpdate;

        const createdAtA = new Date(a.createdAt).getTime() / latestCreation;
        const createdAtB = new Date(b.createdAt).getTime() / latestCreation;

        // Weights for each criterion (total = 1)
        const weights = {
          rating: 0.35,    // 35% weight to rating
          distance: 0.25,  // 25% weight to distance
          reviews: 0.20,   // 20% weight to review count
          updated: 0.15,   // 15% weight to update time
          created: 0.05    // 5% weight to creation time
        };

        // Calculate combined scores
        const scoreA = (
          (weights.rating * ratingA) -
          (weights.distance * distanceA) +
          (weights.reviews * reviewsA) +
          (weights.updated * updatedAtA) +
          (weights.created * createdAtA)
        );

        const scoreB = (
          (weights.rating * ratingB) -
          (weights.distance * distanceB) +
          (weights.reviews * reviewsB) +
          (weights.updated * updatedAtB) +
          (weights.created * createdAtB)
        );

        return scoreB - scoreA;
      });

      return {
        posts: processedPosts,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page
        }
      };
    }

    return {
      posts: posts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
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
