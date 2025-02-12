"use clients";

import { getPosts } from "@/lib/postUtils";
import { Like } from "@prisma/client/edge";
import { DynamicPostWithIncludes, GetPostsResponse, ResponseDataWithCursor, ResponseDataWithLocationAndCursor, SearchWithPaginationOptions } from "@repo/types";
import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult, useQueryClient } from "@tanstack/react-query";

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

type PostsQueryResult = UseInfiniteQueryResult<InfiniteData<PostPage>, Error>;

export const usePosts = (
  params: SearchWithPaginationOptions,
  options: UsePostsOptions = {}
): PostsQueryResult => {
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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function usePostLikeUpdate() {
  const queryClient = useQueryClient();

  const updatePostLike = (postId: string, userId: string, isRemoving: boolean, optimisticLike: Like) => {
    // Update infinite query data (posts list)
    queryClient.setQueriesData<InfiniteData<PostPage>>(
      { queryKey: ['posts'] },
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            posts: !Array.isArray(page.posts) ? {
              ...page.posts,
              posts: page.posts.posts.map(post => {
                if (post.id === postId) {
                  return {
                    ...post,
                    likes: isRemoving
                      ? post.likes.filter(like => like.userId !== userId)
                      : [...post.likes, optimisticLike]
                  };
                }
                return post;
              })
            } : page.posts
          }))
        };
      }
    );

    // Update dynamic query data (single post)
    queryClient.setQueriesData<DynamicPostWithIncludes>(
      { queryKey: ['post', postId, 'dynamic'] },
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          likes: isRemoving
            ? oldData.likes.filter(like => like.userId !== userId)
            : [...oldData.likes, optimisticLike]
        };
      }
    );
  };

  const invalidatePostQueries = (postId: string) => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['post', postId, 'dynamic'] });
  };

  return {
    updatePostLike,
    invalidatePostQueries
  };
}
