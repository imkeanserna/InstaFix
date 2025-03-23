"use client";

import { getFavorites } from "@/lib/favoritesUtils";
import { FavoritesResponseWithCursor, TypeFavorite } from "@repo/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useFavorites = () => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [favoritesState, setFavoritesState] = useState<FavoritesResponseWithCursor>({
    favorites: [],
    pagination: {
      hasNextPage: false,
      endCursor: undefined
    },
    totalCount: 0
  });

  const { isLoading, data, error: queryError } = useQuery<{
    data: FavoritesResponseWithCursor
  }, Error>({
    queryKey: ['favorites'],
    queryFn: async () => await getFavorites({ take: 2 }),
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (data) {
      setFavoritesState({
        favorites: data.data.favorites,
        pagination: data.data.pagination,
        totalCount: data.data.totalCount
      });
    }
  }, [data]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message || 'Failed to fetch favorites');
    }
  }, [queryError]);

  const loadMore = useCallback(async () => {
    if (!favoritesState.pagination.hasNextPage || isLoading) return;
    try {
      setIsLoadingMore(true);
      setError(null);
      const result = await getFavorites({
        cursor: favoritesState.pagination.endCursor,
        take: 2
      });

      const updatedFavorites = [...favoritesState.favorites, ...result.data.favorites];
      setFavoritesState(prev => ({
        favorites: [...prev.favorites, ...result.data.favorites],
        pagination: result.data.pagination,
        totalCount: result.data.totalCount
      }));

      queryClient.setQueryData(['favorites'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            favorites: updatedFavorites,
            pagination: result.data.pagination,
            totalCount: result.data.totalCount
          }
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more conversations');
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    favoritesState.pagination.hasNextPage,
    favoritesState.pagination.endCursor,
    isLoading,
    queryClient,
    favoritesState.favorites,
  ]);

  const addFavorite = useCallback((favorite: TypeFavorite) => {
    setFavoritesState(prev => ({
      ...prev,
      favorites: [favorite, ...prev.favorites],
      totalCount: prev.totalCount + 1
    }));

    queryClient.setQueryData(['favorites'], (oldData: {
      data: FavoritesResponseWithCursor
    }) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: {
          ...oldData.data,
          favorites: [favorite, ...oldData.data.favorites],
          totalCount: oldData.data.totalCount + 1
        }
      };
    });
  }, [queryClient]);

  const removeFavorite = useCallback((favoriteId: string) => {
    setFavoritesState(prev => ({
      ...prev,
      favorites: prev.favorites.filter(fav => fav.id !== favoriteId),
      totalCount: prev.totalCount - 1
    }));
    queryClient.setQueryData(['favorites'], (oldData: {
      data: FavoritesResponseWithCursor
    }) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: {
          ...oldData.data,
          favorites: oldData.data.favorites.filter((fav: TypeFavorite) => fav.id !== favoriteId),
          totalCount: oldData.data.totalCount - 1
        }
      };
    });
  }, [queryClient]);

  const totalFavorites = useMemo(() => {
    return favoritesState.totalCount;
  }, [favoritesState.totalCount]);

  return useMemo(() => ({
    favoritesState,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    addFavorite,
    removeFavorite,
    totalFavorites,
    hasMore: favoritesState.pagination.hasNextPage
  }), [
    favoritesState,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    addFavorite,
    removeFavorite,
    totalFavorites
  ]);
};
