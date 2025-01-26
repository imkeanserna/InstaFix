"use client";

import { CategorySelector } from "@/components/categories/categorySelector";
import { FilterDrawerWrapper } from "@/components/ui/filters";
import { usePosts } from "@/hooks/posts/usePosts";
import { EngagementType, PricingType, ServicesIncluded, TargetAudience } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { motion } from 'framer-motion'
import { Loader2 } from "lucide-react";
import { Location } from "@/components/ui/locationNavigation";
import { PostWithUserInfo } from "@repo/types";
import { getStoredLocation } from "@/lib/sessionUtils";

export function PostsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const lastSelection = useRef<{
    category: string | null;
    subcategory: string | null;
    searchParams: string;
  }>({
    category: null,
    subcategory: null,
    searchParams: ''
  });

  const isCameraRoute = pathname === '/find/camera';
  const detectedString = searchParams.get('detected') || null;
  const professions: string[] = searchParams.get('professions')?.split(',').map((item) => item.trim()) || [];

  useEffect(() => {
    const storedLocation = getStoredLocation();
    const locationParam = searchParams.get('location');

    if (storedLocation && !locationParam) {
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set('location', JSON.stringify(storedLocation));

      const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [router, searchParams]);

  const getInitialState = useCallback(() => {
    return {
      category: searchParams.get('category') || null,
      subcategory: searchParams.get('subcategory') || null,
      location: searchParams.get('location') ? JSON.parse(searchParams.get('location') as string) : getStoredLocation() || null,
      priceMin: Number(searchParams.get('priceMin')) || null,
      priceMax: Number(searchParams.get('priceMax')) || null,
      pricingType: (searchParams.get('pricingType') as PricingType) || null,
      engagementType: (searchParams.get('engagementType') as EngagementType) || null,
      targetAudience: (searchParams.get('targetAudience') as TargetAudience) || null,
      servicesIncluded: searchParams.get('servicesIncluded') ?
        JSON.parse(searchParams.get('servicesIncluded')!) as ServicesIncluded[] :
        []
    }
  }, [searchParams]);

  const updateUrlParams = useCallback((updates: Partial<ReturnType<typeof getInitialState>>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        params.delete(key)
      } else if (typeof value === 'object') {
        params.set(key, JSON.stringify(value))
      } else {
        params.set(key, String(value))
      }
    })
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);

  // Check if only navigation-related params changed (category/subcategory)
  const isOnlyNavigationChange = useCallback((newParams: URLSearchParams, oldParams: URLSearchParams) => {
    const fieldsToCompare = ['location', 'priceMin', 'priceMax', 'pricingType', 'engagementType', 'targetAudience', 'servicesIncluded'];
    return fieldsToCompare.every(field => newParams.get(field) === oldParams.get(field));
  }, []);

  const currentCategory = searchParams.get('category');
  const currentSubcategory = searchParams.get('subcategory');
  const currentSearchParams = searchParams.toString();

  const shouldRefetch = useCallback(() => {
    // Always fetch if it's the first load or if filters changed
    if (!lastSelection.current.searchParams) {
      return true;
    }

    // Check for any changes in search params
    // Check if search query changed and refetch if search query changed
    if (currentSearchParams !== lastSelection.current.searchParams) {
      const oldParams = new URLSearchParams(lastSelection.current.searchParams);
      const newParams = new URLSearchParams(currentSearchParams);
      const categoryChanged = currentCategory !== lastSelection.current.category;
      const subcategoryChanged = currentSubcategory !== lastSelection.current.subcategory;

      return categoryChanged || subcategoryChanged || !isOnlyNavigationChange(newParams, oldParams);
    }

    return false;
  }, [currentCategory, currentSubcategory, currentSearchParams, isOnlyNavigationChange]);

  // Update lastSelection when component mounts or category/subcategory changes
  useEffect(() => {
    lastSelection.current = {
      category: currentCategory,
      subcategory: currentSubcategory,
      searchParams: currentSearchParams
    };
  }, [currentCategory, currentSubcategory, currentSearchParams]);

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = usePosts({
    categoryIds: searchParams.get('category') ? [searchParams.get('category')!] : undefined,
    subcategoryIds: searchParams.get('subcategory') ? [searchParams.get('subcategory')!] : undefined,
    location: searchParams.get('location')
      ? (() => {
        const parsedLocation: Location = JSON.parse(searchParams.get('location')!);
        return {
          latitude: parsedLocation.lat,
          longitude: parsedLocation.lng,
          radiusInKm: 20
        };
      })()
      : undefined,
    price: searchParams.get('pricingType') ? {
      min: Number(searchParams.get('priceMin')),
      max: Number(searchParams.get('priceMax')),
      type: searchParams.get('pricingType') as PricingType
    } : undefined,
    engagementType: searchParams.get('engagementType') as EngagementType | undefined,
    targetAudience: searchParams.get('targetAudience') as TargetAudience | undefined,
    servicesIncluded: searchParams.get('servicesIncluded') ?
      JSON.parse(searchParams.get('servicesIncluded')!) :
      undefined
  }, {
    shouldRefetch: shouldRefetch()
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {isCameraRoute && detectedString && professions.length > 0 &&
        <div>
          <p>AI Detected: It looks you have issue on {detectedString}</p>
          <div className="space-x-2">
            {professions.map(profession => (
              <span
                key={profession}
                className="border border-gray-300 px-2 py-1 rounded-md bg-gray-100 text-xs">
                {profession}
              </span>
            ))}
          </div>
        </div>
      }
      <div className="">
        {!isCameraRoute && (
          <div className="lg:col-span-4">
            <FilterDrawerWrapper
              initialState={getInitialState()}
              onFilterChange={updateUrlParams}
            />
          </div>
        )}
        <div className="lg:col-span-8">
          {!isCameraRoute && (
            <CategorySelector
              initialState={{
                category: searchParams.get('category') || null,
                subcategory: searchParams.get('subcategory') || null
              }}
              onCategoryChange={(category, subcategory) =>
                updateUrlParams({ category, subcategory })}
            />
          )}
          <div className="mt-8">
            <PostsGrid
              postsData={postsData}
              isLoading={isLoading}
              error={error}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface PostsGridProps {
  postsData: any
  isLoading: boolean
  error: Error | null
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}

export function PostsGrid({
  postsData,
  isLoading,
  error,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore
}: PostsGridProps) {
  const allPosts = postsData?.pages.flatMap((page: any) =>
    Array.isArray(page.posts) ? page.posts : page.posts.posts
  ) || []

  if (isLoading && !isFetchingNextPage) {
    return <div className="flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-2 text-center"
      >
        <Loader2 className="w-8 h-8 mx-auto text-yellow-500 animate-spin" />
        <p className="text-sm text-gray-600">Loading posts...</p>
      </motion.div>
    </div>
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">
      Error loading posts
    </div>
  }

  if (allPosts.length === 0) {
    return <div className="text-center p-8 text-gray-500">
      No posts found
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {allPosts.map((post: (PostWithUserInfo & {
          distance: number | null
        })) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <p>{post.title}</p>
              <p>{post.pricingType === PricingType.HOURLY ? `$${post.hourlyRate}` : `$${post.fixedPrice}`}</p>
              <p>{post.distance}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {hasNextPage && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
