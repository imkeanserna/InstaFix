"use client"

import { getPostDynamic, getPostStatic } from "@/lib/postUtils";
import { DynamicPostWithIncludes, StaticPostWithIncludesWithHighlights } from "@repo/types";
import { useQuery } from "@tanstack/react-query";

export function usePostData(postId: string) {
  const staticQuery = useQuery<StaticPostWithIncludesWithHighlights, Error>({
    queryKey: ['post', postId, 'static'],
    queryFn: async () => await getPostStatic({ postId: postId }),
    enabled: Boolean(postId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const dynamicQuery = useQuery<DynamicPostWithIncludes, Error>({
    queryKey: ['post', postId, 'dynamic'],
    queryFn: async () => await getPostDynamic({ postId: postId }),
    enabled: Boolean(postId),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    staticData: staticQuery.data,
    dynamicData: dynamicQuery.data,
    isLoading: staticQuery.isLoading || dynamicQuery.isLoading,
    isError: staticQuery.isError || dynamicQuery.isError,
    error: staticQuery.error || dynamicQuery.error,
  };
}
