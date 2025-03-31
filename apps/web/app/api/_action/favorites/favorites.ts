import { prisma } from '@/server/index';
import { FavoritesResponseWithCursor, TypeFavorite } from '@repo/types';

export const runtime = 'edge'

export async function getFavorites({
  userId,
  cursor,
  take
}: {
  userId: string;
  cursor: string | undefined;
  take: number
}): Promise<FavoritesResponseWithCursor> {
  try {
    if (!userId) {
      throw new Error('User Id is required');
    }

    const totalCount: number = await prisma.like.count({
      where: {
        userId: userId
      }
    });

    const favorites: TypeFavorite[] = await prisma.like.findMany({
      take: take + 1,
      where: {
        userId: userId,
        ...(cursor && { id: { lt: cursor } })
      },
      select: {
        id: true,
        post: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                name: true
              }
            },
            location: {
              select: {
                city: true,
                state: true,
                country: true
              }
            },
            averageRating: true,
            coverPhoto: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        createdAt: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    const hasNextPage = favorites.length > take;
    const paginatedFavorites = hasNextPage ? favorites.slice(0, take) : favorites;
    const endCursor = hasNextPage ? paginatedFavorites[paginatedFavorites.length - 1].id : undefined;

    return {
      favorites: paginatedFavorites,
      pagination: {
        hasNextPage,
        endCursor
      },
      totalCount
    };
  } catch (error) {
    throw error;
  }
}
