import { FavoritesResponseWithCursor } from "@repo/types";

export type GetFavoritesResponse = {
  success: boolean;
  data: FavoritesResponseWithCursor;
  error?: string;
}

export async function getFavorites({
  cursor,
  take
}: {
  cursor?: string | null;
  take: number;
}) {
  const queryParams = new URLSearchParams();
  queryParams.append("take", String(take));

  if (cursor) {
    queryParams.append("cursor", cursor);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `${process.env.NEXT_BACKEND_URL}/api/favorites?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GetFavoritesResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch conversations');
    }

    return {
      data: result.data,
      nextCursor: result.data.favorites.length > 0 ? result.data.pagination?.endCursor : undefined
    };
  } catch (error) {
    return {
      data: {
        favorites: [],
        pagination: {
          hasNextPage: false,
        },
        totalCount: 0
      },
      nextCursor: undefined
    };
  }
}
