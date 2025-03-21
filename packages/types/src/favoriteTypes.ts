import { Prisma } from "@prisma/client/edge";
import { CursorPagination } from "./postTypes";

const favoritesSelect = {
  id: true,
  post: {
    select: {
      id: true,
      title: true,
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
  createdAt: true
} as const;

export type TypeFavorite = Prisma.LikeGetPayload<{
  select: typeof favoritesSelect
}>;

export type FavoritesResponseWithCursor = {
  favorites: TypeFavorite[];
  pagination: CursorPagination;
}
