import { Prisma } from "@prisma/client/edge";
import { CursorPagination } from "./postTypes";

const favoritesSelect = {
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
} as const;

export type TypeFavorite = Prisma.LikeGetPayload<{
  select: typeof favoritesSelect
}>;

export type TypeActionFavorite = {
  favorite: TypeFavorite;
  isLike: boolean;
}

export type FavoritesResponseWithCursor = {
  favorites: TypeFavorite[];
  pagination: CursorPagination;
  totalCount: number;
}
