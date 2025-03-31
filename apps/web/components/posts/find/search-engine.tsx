"use client";

import { SearchSuggestion, SearchSuggestionType } from "@repo/types";
import { useDebounce } from "@/hooks/useDebounce";
import { getPopularSearchSuggestions, getSearchSuggestions, SEARCH_SUGGESTIONS } from "@/lib/searchEngineUtils";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@repo/ui/components/ui/command";
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Badge } from "@repo/ui/components/ui/badge"
import {
  Search,
  X,
  ArrowRight,
  BriefcaseBusiness,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from "react";
import { z } from 'zod';
import Image from "next/image";
import { useMediaQuery } from "@/hooks/useMedia";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const searchQuerySchema = z.object({
  q: z.string().min(3).max(100),
  limit: z.number().min(1).max(50).optional().default(5)
});

export function SearchEngine({ children }: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const debouncedValue = useDebounce(inputValue, 300);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: popularSuggestions = [], isLoading: isLoadingPopular } = useQuery({
    queryKey: ['popular-searches'],
    queryFn: ({ signal }) => getPopularSearchSuggestions({
      limit: 10,
      signal
    }),
    staleTime: 12 * 60 * 60 * 1000, // Consider data fresh for 12 hours
    gcTime: 24 * 60 * 60 * 1000,
    enabled: open && !debouncedValue,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  const fetchSuggestions = async ({
    query,
    limit = 5,
    signal
  }: {
    query: string;
    limit: number;
    signal?: AbortSignal;
  }): Promise<SearchSuggestion[]> => {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    try {
      const validatedQuery = searchQuerySchema.parse({
        q: query,
        limit
      });

      return getSearchSuggestions({
        query: validatedQuery.q.trim(),
        limit: validatedQuery.limit,
        signal
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message);
      }
      throw error;
    }
  };

  const { data: suggestions = [], isLoading: isLoadingSuggestions, error } = useQuery({
    queryKey: ['search-suggestions', debouncedValue],
    queryFn: ({ signal }) => fetchSuggestions({
      query: debouncedValue,
      limit: 5,
      signal
    }),
    enabled: debouncedValue.length >= 2,
    staleTime: 12 * 60 * 60 * 1000, // Consider data fresh for 12 hours
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    throwOnError: false
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "j") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Prefetch recent searches
  useEffect(() => {
    if (open) {
      // Prefetch popular searches
      queryClient.prefetchQuery({
        queryKey: ['popular-searches'],
        queryFn: ({ signal }) => getPopularSearchSuggestions({ limit: 10, signal }),
        staleTime: 12 * 60 * 60 * 1000,
      });

      const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      recentSearches.forEach((search: string) => {
        queryClient.prefetchQuery({
          queryKey: ['search-suggestions', search],
          queryFn: ({ signal }) => fetchSuggestions({ query: search, limit: 5, signal }),
          staleTime: 12 * 60 * 60 * 1000,
        });
      });
    }
  }, [open, queryClient]);

  // Save successful searches
  useEffect(() => {
    if (suggestions.length > 0 && debouncedValue.length >= 2) {
      const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const updatedSearches = [
        debouncedValue,
        ...recentSearches.filter((s: string) => s !== debouncedValue)
      ].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    }
  }, [suggestions, debouncedValue]);

  const getSuggestionImage = (type: SearchSuggestionType) => {
    const config = SEARCH_SUGGESTIONS[type] || SEARCH_SUGGESTIONS.default;
    return (
      <Image
        src={config.src}
        alt={config.alt}
        className="rounded-xl h-full object-cover"
        width={config.width}
        height={config.height}
      />
    );
  };

  const getSuggestionDescription = (type: SearchSuggestionType) => {
    switch (type) {
      case 'popular':
        return "trending right now";
      case 'post':
        return "recent blog post";
      case 'category':
        return "main category";
      case 'subcategory':
        return "specialized section";
      default:
        return "";
    }
  };

  const renderSuggestionText = (text: string) => {
    if (text.includes('›')) {
      const parts = text.split('›');
      return <span className="font-medium">{parts[parts.length - 1].trim()}</span>;
    }
    return <span>{text}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="p-0 md:w-[60%] lg:w-[40%] w-full h-full md:h-auto max-w-5xl rounded-none md:!rounded-2xl overflow-hidden">
        <div className="relative">
          <Command className="rounded-lg border shadow-md">
            <div className="flex items-center border-b px-3 bg-white">
              {!useMediaQuery('(min-width: 768px)') ? (
                <button
                  onClick={() => setOpen(false)}
                  className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-400" />
                </button>
              ) : (
                <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
              )}
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputValue.trim()) {
                    try {
                      const validatedQuery = searchQuerySchema.parse({
                        q: inputValue.trim(),
                        limit: 5
                      });
                      router.push(`/find/search?query=${encodeURIComponent(validatedQuery.q)}&complete=true`);
                      setOpen(false);
                    } catch (error) {
                      setOpen(true);
                    }
                  }
                }}
                placeholder="Search categories, posts, and more..."
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm 
                          outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {inputValue && (
                <button
                  onClick={() => setInputValue('')}
                  className="p-1 hover:bg-gray-500 bg-gray-400 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-100" />
                </button>
              )}
            </div>
            <CommandList className="max-h-full overflow-y-auto">
              {debouncedValue && !isLoadingSuggestions && suggestions.length === 0 && (
                <CommandEmpty className="py-6 text-center text-sm">
                  {error ? (
                    <span className="text-red-500">
                      {error instanceof Error ? error.message : 'Failed to fetch suggestions'}
                    </span>
                  ) : (
                    'No results found.'
                  )}
                </CommandEmpty>
              )}
              {isLoadingSuggestions && (
                <SearchSkeleton />
              )
              }
              {suggestions.length > 0 && (
                <CommandGroup className={`${debouncedValue ? "border-b border-gray-200 pb-4" : ""}`}>
                  <div className="flex items-center gap-2 p-4">
                    <p className="semibold text-sm">Results</p>
                    <span className="bg-gray-100 rounded-full px-2 py-1 text-xs">{suggestions.length}</span>
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={`${suggestion.type}-${index}`}
                      className="group flex items-start justify-start gap-3 py-3 px-4 cursor-pointer transition-all duration-200 hover:bg-gray-50"
                      onSelect={() => {
                        setOpen(false);
                        router.push(`/find/search?query=${encodeURIComponent(suggestion.text)}&complete=true`);
                      }}
                    >
                      <div className="flex-shrink-0 relative h-[56px] w-[56px] overflow-hidden rounded-xl"
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        {getSuggestionImage(suggestion.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate transition-colors duration-200 group-hover:text-yellow-600">
                          {renderSuggestionText(suggestion.text)}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <BriefcaseBusiness className="h-1 w-1" />
                            {getSuggestionDescription(suggestion.type)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 absolute right-4 transition-all duration-200">
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize bg-gray-100 text-gray-600 transition-all duration-200 transform group-hover:translate-x-[-8px] group-hover:bg-blue-50 group-hover:text-yellow-600"
                        >
                          {suggestion.type}
                        </Badge>
                        <ArrowRight
                          className="h-4 w-4 text-gray-400 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-yellow-600 hidden group-hover:inline-block"
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {popularSuggestions.length > 0 && (
                <CommandGroup className="p-6">
                  <div className="flex items-center gap-2 py-4">
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                    <p className="font-semibold text-sm">Popular Searches</p>
                    <span className="bg-yellow-100 text-yellow-700 rounded-full px-2 py-1 text-xs">
                      Trending
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {popularSuggestions.map((suggestion, index) => (
                      <div
                        key={`popular-${index}`}
                        onClick={() => {
                          setInputValue(suggestion.query)
                          router.push(`/find/search?query=${encodeURIComponent(suggestion.query)}&complete=true`)
                          setOpen(false);
                        }}
                        className="
                            inline-flex items-center gap-2 px-4 py-2 rounded-3xl
                            cursor-pointer bg-gray-50 hover:bg-yellow-50 transition-colors
                            border hover:border-yellow-500
                            "
                      >
                        <span className="text-sm text-gray-800">
                          {suggestion.query}
                        </span>
                      </div>
                    ))}
                  </div>
                </CommandGroup>
              )}
              {isLoadingPopular && !debouncedValue && (
                <PopularSuggestionsSkeleton />
              )}
            </CommandList>
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SearchSkeleton() {
  return (
    <div className={`border-b border-gray-200 pb-4`}>
      <div className="flex items-center gap-2 p-4">
        <p className="semibold text-sm">Results</p>
        <Skeleton className="bg-gray-100 rounded-full px-2 py-1 w-8 h-5" />
      </div>
      {
        [1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="group flex items-start justify-start gap-3 py-3 px-6"
          >
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/12" />
              <div className="flex items-center gap-2 mt-1">
                <Skeleton className="h-3 w-1/6" />
              </div>
            </div>
            <div className="absolute right-4">
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
          </div>
        ))
      }
    </div>
  );
}

function PopularSuggestionsSkeleton() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 py-4">
        <TrendingUp className="h-4 w-4 text-yellow-500" />
        <p className="font-semibold text-sm">Popular Searches</p>
        <Skeleton className="rounded-full px-2 py-1 w-16 h-5" />
      </div>
      <div className="flex flex-wrap gap-4 mt-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <Skeleton
            key={item}
            className="inline-flex px-4 py-2 rounded-3xl w-32 h-10"
          />
        ))}
      </div>
    </div>
  )
}
