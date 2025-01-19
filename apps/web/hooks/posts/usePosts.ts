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

export const usePosts = (params: SearchWithPaginationOptions) => {
  return useInfiniteQuery<
    PostQueryResponse,
    Error,
    InfiniteData<PostPage>,
    [string, SearchWithPaginationOptions],
    string | undefined
  >({
    queryKey: ['posts', params],
    queryFn: async ({ pageParam }) => {
      const result: GetPostsResponse = await getPosts({ ...params, cursor: pageParam });

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
    staleTime: 1000 * 60 * 2,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}
