"use client";

import { usePosts } from "@/hooks/posts/usePosts";
import { useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { PostsGrid } from "./postsPage";
import { getStoredLocation } from "@/lib/sessionUtils";

export function SearchPage() {
  const searchParams = useSearchParams();
  const currentSearchParams = searchParams.toString();
  const currentSearchQuery = searchParams.get('query');
  const isComplete = searchParams.get('complete') === 'true';
  const storedLocation = getStoredLocation();

  const lastSelection = useRef<{
    searchParams: string;
    searchQuery: string | null;
  }>({
    searchParams: '',
    searchQuery: null
  });

  const shouldRefetch = useCallback(() => {
    if (!lastSelection.current.searchParams) {
      return true;
    }
    // Check for any changes in search params
    // Check if search query changed and refetch if search query changed
    if (currentSearchParams !== lastSelection.current.searchParams) {
      const searchQueryChanged = currentSearchQuery !== lastSelection.current.searchQuery;
      return searchQueryChanged;
    }
    return false;
  }, [currentSearchParams, currentSearchQuery]);

  const {
    data: searchResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = usePosts({
    location: {
      latitude: storedLocation?.lat || 0,
      longitude: storedLocation?.lng || 0,
      radiusInKm: 20
    },
    searchQuery: currentSearchQuery || undefined,
    complete: isComplete ? 'true' : 'false',
  }, {
    shouldRefetch: shouldRefetch()
  });

  if (isLoading && !isFetchingNextPage) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2 text-center"
        >
          <Loader2 className="w-8 h-8 mx-auto text-yellow-500 animate-spin" />
          <p className="text-sm text-gray-600">Searching...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        Error performing search
      </div>
    );
  }

  return (
    <div className="mt-8">
      <PostsGrid
        postsData={searchResults}
        isLoading={isLoading}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </div>
  );
}
