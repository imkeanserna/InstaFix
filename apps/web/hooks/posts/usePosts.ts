"use clients";

import { getPosts } from "@/lib/postUtils";
import { GetPostsResponse, ResponseDataWithCursor, ResponseDataWithLocationAndCursor, SearchWithPaginationOptions } from "@repo/types";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

export type PostPage = {
  posts: ResponseDataWithLocationAndCursor | ResponseDataWithCursor;
  nextCursor?: string | undefined;
};

type PostQueryResponse = {
  posts: ResponseDataWithLocationAndCursor | ResponseDataWithCursor | [];
  nextCursor: string | undefined;
};

type UsePostsOptions = {
  shouldRefetch?: boolean;
};

export const usePosts = (
  params: SearchWithPaginationOptions,
  options: UsePostsOptions = {}
) => {
  const { shouldRefetch = true } = options;
  return useInfiniteQuery<
    PostQueryResponse,
    Error,
    InfiniteData<PostPage>,
    [string, SearchWithPaginationOptions],
    string | undefined
  >({
    queryKey: ['posts', params],
    queryFn: async ({ pageParam }) => {
      const transformedParams = {
        ...params,
        location: params.location ? {
          latitude: params.location.latitude,
          longitude: params.location.longitude,
          radiusInKm: params.location.radiusInKm
        } : undefined,
        cursor: pageParam
      };

      const result: GetPostsResponse = await getPosts(transformedParams);

      if (Array.isArray(result.data)) {
        return {
          posts: [],
          nextCursor: undefined,
        };
      }

      const hasMorePosts = result.data.posts.length > 0 &&
        result.data.pagination?.hasNextPage;

      return {
        posts: result.data,
        nextCursor: hasMorePosts ? result.nextCursor : undefined
      };
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (Array.isArray(lastPage.posts)) {
        return undefined
      }
      if (lastPage.posts.posts?.length === 0) return undefined;
      if (!lastPage.posts.pagination?.hasNextPage) return undefined;
      return lastPage.nextCursor;
    },
    enabled: shouldRefetch,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    retry: 2,
    refetchOnWindowFocus: true,
  });
}
