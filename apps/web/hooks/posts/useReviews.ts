"use clients";

import { getReviews } from "@/lib/reviewsUtils";
import { ReviewsResponseWithCursor } from "@repo/types";
import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult } from "@tanstack/react-query";

type ReviewPage = {
  reviews: ReviewsResponseWithCursor | [];
  nextCursor?: string | undefined;
}

type PostsQueryResult = UseInfiniteQueryResult<InfiniteData<ReviewPage>, Error>;

export const useReviews = (
  postId: string,
  take: number = 10,
): PostsQueryResult => {
  return useInfiniteQuery<
    ReviewPage,
    Error,
    InfiniteData<ReviewPage>,
    [string, string, number],
    string | undefined
  >({
    queryKey: ['reviews', postId, take],
    queryFn: async ({ pageParam }) => {
      const result: {
        data: ReviewsResponseWithCursor | [];
        nextCursor?: string | undefined;
      } = await getReviews({
        postId,
        cursor: pageParam,
        take
      });

      if (Array.isArray(result.data)) {
        return {
          reviews: [],
          nextCursor: undefined,
        };
      }

      const hasMoreReviews = result.data.reviews.length > 0 &&
        result.data.pagination?.hasNextPage;

      return {
        reviews: result.data,
        nextCursor: hasMoreReviews ? result.nextCursor : undefined
      };
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (Array.isArray(lastPage.reviews)) {
        return undefined;
      }

      if (lastPage.reviews.reviews.length === 0) return undefined;
      if (!lastPage.reviews.pagination?.hasNextPage) return undefined;
      return lastPage.nextCursor;
    },
    enabled: Boolean(postId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
