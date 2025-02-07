import { Prisma } from '@prisma/client/edge';

type PostOrderBy = {
  averageRating: { sort: Prisma.SortOrder; nulls: Prisma.NullsOrder };
} | {
  reviews: { _count: Prisma.SortOrder };
} | {
  updatedAt: Prisma.SortOrder;
} | {
  createdAt: Prisma.SortOrder;
};

type PostOrderByArray = PostOrderBy[];

export const DEFAULT_INCLUDE = {
  media: true,
  location: true,
  reviews: {
    select: {
      rating: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
  user: {
    select: {
      name: true,
      image: true
    }
  },
} as const;

export const DEFAULT_ORDER_BY: PostOrderByArray = [
  { averageRating: { sort: 'desc', nulls: 'last' } },
  { reviews: { _count: 'desc' } },
  { updatedAt: 'desc' },
  { createdAt: 'desc' },
] as const;

interface DensityConfig {
  minPosts: number;
  initialRadius: number;
  maxRadius: number;
  expansionStep: number;
}

// Density configuration
export const DENSITY_CONFIG: DensityConfig = {
  minPosts: 20,        // Minimum desired posts
  initialRadius: 5,    // Start with 5km radius
  maxRadius: 100,      // Never exceed 100km
  expansionStep: 5     // Increase by 5km each time
};
