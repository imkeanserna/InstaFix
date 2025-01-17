import { prisma } from '@/server/index';
import { Category, Freelancer, Post, PostTag } from '@prisma/client/edge'
import { ResponseDataWithLocation, ResponseDataWithoutLocation, PostWithUserInfo } from "@repo/types";
import { PostUpdateHandlers } from './updateHandlers';
import { UpdatePostData, FilterOptions } from "@repo/types";
import { getLocationBasedQuery, getNonLocationQuery, processLocationBasedPosts } from './location';
import { DEFAULT_INCLUDE, DEFAULT_ORDER_BY, DENSITY_CONFIG } from '../constant/queryPost';
import { buildBaseConditions, buildSearchQuery } from '../helper/postUtils';

export const runtime = 'edge'

export type PostWithRelations = Post & {
  freelancer: Freelancer;
  tags: (PostTag & {
    subcategory: {
      category: Category;
    };
  })[];
};

type WhereSearch = Record<string, unknown>;

type WhereClause = {
  AND?: {
    OR: (
      | { serviceLocation: 'ONLINE' }
      | { serviceLocation: 'HYBRID' }
      | { title: { contains: string; mode: 'insensitive' } }
    )[];
  }[];
} & WhereSearch;

export async function getPosts(options: FilterOptions): Promise<ResponseDataWithLocation | ResponseDataWithoutLocation> {
  try {
    const {
      page = 1,
      limit = 10,
      location,
      searchQuery
    } = options;
    const skip = (page - 1) * limit;
    const searchTerms = searchQuery?.toLowerCase().trim().split(/\s+/);

    if (location?.latitude && location?.longitude) {
      let currentRadius = DENSITY_CONFIG.initialRadius;
      let posts: PostWithUserInfo[] = [];
      let total = 0;
      let finalRadius = currentRadius;

      // Keep expanding radius until we have enough posts or hit max radius
      while (currentRadius <= DENSITY_CONFIG.maxRadius) {
        let where = getLocationBasedQuery({ ...location, radiusInKm: currentRadius });
        where = searchQuery && searchTerms
          ? { ...where, ...buildSearchQuery(searchTerms) }
          : { ...where, ...buildBaseConditions(options) };

        // Count posts at current radius
        const postCount = await prisma.post.count({ where });

        // We found enough posts, get the actual data
        if (postCount > 0 && (postCount >= DENSITY_CONFIG.minPosts || currentRadius === DENSITY_CONFIG.maxRadius)) {
          [posts, total] = await Promise.all([
            prisma.post.findMany({
              skip,
              take: limit,
              include: DEFAULT_INCLUDE,
              orderBy: DEFAULT_ORDER_BY,
              where
            }),
            Promise.resolve(postCount)
          ]);
          finalRadius = currentRadius;
          break;
        }
        currentRadius += DENSITY_CONFIG.expansionStep;
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
      let where: WhereClause = searchQuery && searchTerms
        ? {
          ...buildSearchQuery(searchTerms),
          AND: [
            {
              OR: [
                { serviceLocation: 'ONLINE' },
                { serviceLocation: 'HYBRID' },
              ],
            },
            {
              OR: searchTerms?.map(term => ({
                title: {
                  contains: term,
                  mode: 'insensitive' as const,
                },
              })) || [],
            },
          ],
        }
        : {
          ...getNonLocationQuery(options.categoryName, options.subcategoryName),
          ...buildBaseConditions(options)
        };

      const [posts, total]: [PostWithUserInfo[], number] = await Promise.all([
        prisma.post.findMany({
          skip,
          take: limit,
          include: DEFAULT_INCLUDE,
          orderBy: DEFAULT_ORDER_BY,
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
