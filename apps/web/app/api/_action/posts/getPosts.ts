import { prisma } from '@/server/index';
import { Category, User, Post, PostTag } from '@prisma/client/edge'
import { PostUpdateHandlers } from './updateHandlers';
import {
  UpdatePostData,
  PostWithUserInfo,
  CursorPaginationOptions,
  ResponseDataWithLocationAndCursor,
  ResponseDataWithCursor,
} from "@repo/types";
import { getLocationBasedQuery, getNonLocationQuery, processLocationBasedPosts } from './location';
import { DEFAULT_INCLUDE, DEFAULT_ORDER_BY, DENSITY_CONFIG } from '../constant/queryPost';
import { buildBaseConditions, buildSearchQuery } from '../helper/postUtils';

export const runtime = 'edge'

export type PostWithRelations = Post & {
  user: User;
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

export async function getPosts(options: CursorPaginationOptions): Promise<ResponseDataWithLocationAndCursor | ResponseDataWithCursor> {
  try {
    const {
      cursor,
      take = 10,
      location,
      searchQuery
    } = options;
    const searchTerms = searchQuery?.toLowerCase().trim().split(/\s+/);

    if (location?.latitude && location?.longitude) {
      let currentRadius = DENSITY_CONFIG.initialRadius;
      let posts: PostWithUserInfo[] = [];
      let finalRadius = currentRadius;
      let hasNextPage = false;
      let endCursor: string | undefined;

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
          // Fetch one extra post to determine if there's a next page
          const fetchedPosts = await prisma.post.findMany({
            take: take + 1,
            skip: cursor ? 1 : 0, // Skip the cursor item if it exists
            cursor: cursor ? { id: cursor } : undefined,
            include: DEFAULT_INCLUDE,
            orderBy: DEFAULT_ORDER_BY,
            where
          });

          hasNextPage = fetchedPosts.length > take;
          posts = fetchedPosts.slice(0, take);

          if (posts.length > 0) {
            endCursor = posts[posts.length - 1].id;
          }

          finalRadius = currentRadius;
          const processedPosts: (PostWithUserInfo & {
            distance: number
          })[] = processLocationBasedPosts(posts, location, finalRadius);

          return {
            posts: processedPosts,
            pagination: {
              cursor,
              hasNextPage,
              endCursor
            },
            searchRadius: finalRadius,
            density: postCount / (Math.PI * finalRadius * finalRadius)
          };
        }

        currentRadius += DENSITY_CONFIG.expansionStep;
      }

      return {
        posts: [],
        pagination: {
          cursor,
          hasNextPage: false
        },
        searchRadius: finalRadius,
        density: 0
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
          ...getNonLocationQuery(options.categoryIds, options.subcategoryIds),
          ...buildBaseConditions(options)
        };

      const fetchedPosts = await prisma.post.findMany({
        take: take + 1,
        skip: cursor ? 1 : 0, // Skip the cursor item if it exists
        cursor: cursor ? { id: cursor } : undefined,
        include: DEFAULT_INCLUDE,
        orderBy: DEFAULT_ORDER_BY,
        where
      });

      const hasNextPage = fetchedPosts.length > take;
      const posts: (
        PostWithUserInfo &
        { distance: number | null }
      )[] = fetchedPosts.slice(0, take) as (PostWithUserInfo & { distance: number | null })[];;
      const endCursor = posts.length > 0 ? posts[posts.length - 1].id : undefined;

      return {
        posts,
        pagination: {
          cursor,
          hasNextPage,
          endCursor
        }
      };
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function getSubCategory({ profession }: { profession: string[] }) {
  try {
    const subCategories = await prisma.subcategory.findMany({
      where: {
        name: {
          in: profession
        }
      },
      select: {
        id: true,
        name: true,
        imageSrc: true,
        categoryId: true
      }
    });

    return subCategories;
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

export async function getCreatePostById(userId: string, postId: string) {
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

export async function getPostByUser(userId: string) {
  try {
    if (!userId) throw new Error('Missing user id');

    const posts: PostWithUserInfo[] = await prisma.post.findMany({
      where: {
        userId: userId
      },
      include: {
        location: true,
        media: true,
        reviews: {
          select: {
            rating: true,
            createdAt: true
          }
        },
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}
