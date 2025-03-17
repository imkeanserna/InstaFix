"use client";

import { CategorySelector } from "@/components/categories/categorySelector";
import { FilterDrawerWrapper } from "@/components/ui/filters";
import { usePosts } from "@/hooks/posts/usePosts";
import { EngagementType, PricingType, ServicesIncluded, TargetAudience } from "@prisma/client/edge";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Location } from "@/components/ui/locationNavigation";
import { getStoredLocation } from "@/lib/sessionUtils";
import { ImageUpload } from "@/components/ui/imageUpload";
import { PostsGrid } from "./postsCard";
import { useImageProcessing } from "@/hooks/useImageActions";
import { CubeLoader } from "@/components/ui/cubeLoading";
import { messages } from "@/components/camera/diaglogCamera";

export function PostsPage() {
  const url = useRef(new URLSearchParams());
  const searchParams = useSearchParams();
  const [errorImage, setErrorImage] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const lastSelection = useRef<{
    category: string | null;
    subcategory: string | null;
    searchParams: string;
  }>({
    category: null,
    subcategory: null,
    searchParams: ''
  });

  const {
    processImage,
    isProcessing,
  } = useImageProcessing({
    onSuccess: ({ detected, professions, subCategories }) => {
      if (subCategories?.length) {
        url.current.set('category', Array.from(new Set(subCategories?.map((item) => item.categoryId))).join(','));
        url.current.set('subcategory', subCategories?.map((item) => item.id).join(','));
      }

      if (professions && professions.length > 0) {
        url.current.set('professions', professions.join(','));
      }

      if (detected) {
        url.current.set('detected', detected);
      }

      router.push(`/find/camera?${url.current.toString()}`);
    },
    externalErrorSetter: setErrorImage,
    onError: async (error) => {
      setErrorImage(error);
    }
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
    <div className="pb-8 pt-4 w-full">
      {isCameraRoute && detectedString && professions.length > 0 &&
        <div className="mb-6 md:mb-10 mt-8 px-6 md:px-0">
          <div className="relative z-10">
            <div className="flex items-start md:items-center mb-4">
              <span className="flex h-3 w-3 relative mr-3 mt-1 md:mt-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
              <div className="flex gap-3 md:gap-2 flex-col md:flex-row text-sm">
                <span className="text-yellow-500 font-bold whitespace-nowrap">AI Detected:</span>
                <span className="text-gray-600 font-medium">{`"`} Hi, It looks you have issue on
                  <span className="font-bold text-gray-900 italic"> {detectedString}</span> {`"`}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-8 md:mt-3">
              <p className="text-gray-600 text-xs font-medium">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {professions.map(profession => (
                  <span
                    key={profession}
                    className="inline-flex items-center py-1 px-3 text-xs font-medium text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-yellow-400 rounded-r-md shadow-sm hover:shadow hover:border-yellow-500 transition-all duration-200"
                  >
                    {profession}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      }

      {!isCameraRoute && (
        <div className="flex flex-col px-2 md:px-0">
          {/* Mobile "Select all" button */}
          <button
            className="md:hidden text-right text-xs text-gray-900 hover:underline mb-2"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            {showMobileFilters ? 'Hide filters' : 'See All'}
          </button>
          <div className={`md:hidden ${showMobileFilters ? 'flex justify-end gap-2' : 'hidden'}`}>
            <FilterDrawerWrapper
              initialState={getInitialState()}
              onFilterChange={updateUrlParams}
            />
            <ImageUpload processImage={processImage} />
          </div>

          {/* Main content area & Desktop filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-12 mb-8">
            <div className="min-w-0">
              <CategorySelector
                initialState={{
                  category: searchParams.get('category') || null,
                  subcategory: searchParams.get('subcategory') || null
                }}
                onCategoryChange={(category, subcategory) =>
                  updateUrlParams({ category, subcategory })}
              />
            </div>
            <div className="hidden md:flex gap-5">
              <FilterDrawerWrapper
                initialState={getInitialState()}
                onFilterChange={updateUrlParams}
              />
              <ImageUpload processImage={processImage} />
            </div>
          </div>
        </div>
      )}

      <div className="px-6 md:px-0">
        <PostsGrid
          postsData={postsData || undefined}
          isLoading={isLoading}
          error={error}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      </div>
      {isProcessing && (
        <div className="absolute inset-0 pointer-events-none z-30">
          <CubeLoader messages={messages} />
        </div>
      )}
    </div>
  );
}
