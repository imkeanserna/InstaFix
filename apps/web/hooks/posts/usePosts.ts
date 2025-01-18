"use clients";

import { FetchPostsParams, getPosts } from "@/lib/postUtils";
import { ResponseDataWithLocation, ResponseDataWithoutLocation } from "@repo/types";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

export type PostPage = {
  posts: ResponseDataWithLocation | ResponseDataWithoutLocation;
  nextCursor?: number | undefined;
};

type PostQueryResponse = {
  posts: ResponseDataWithLocation | ResponseDataWithoutLocation | [];
  nextCursor: number | undefined;
};

export const usePosts = (params: FetchPostsParams) => {
  return useInfiniteQuery<
    PostQueryResponse,
    Error,
    InfiniteData<PostPage>,
    [string, FetchPostsParams],
    number
  >({
    queryKey: ['posts', params],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getPosts({ ...params, page: pageParam });
      return {
        posts: result.data,
        nextCursor: result.nextCursor
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 2,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}
