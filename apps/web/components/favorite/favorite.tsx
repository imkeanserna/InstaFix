"use client";

import { useFavorites } from "@/hooks/favorites/useFavorites";
import { useLike } from "@/hooks/posts/useLike";
import { Like } from "@prisma/client";
import { TypeFavorite } from "@repo/types";
import { Button } from "@repo/ui/components/ui/button";
import { ChevronLeft, Heart, MapPin, Star } from "lucide-react";
import { LazyPostImage } from "../posts/lazyImage";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextSkeleton } from "../posts/find/postsCard";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { groupItemsByDate, sortDateGroupKeys } from "@/lib/dateFormatters";
import { LoadingSpinnerMore } from "@repo/ui/components/ui/loading-spinner-more";
import { FavoriteSkeleton } from "./skeleton";

export function Favorite() {
  const {
    favoritesState,
    isLoading,
    loadMore,
    hasMore,
    isLoadingMore
  } = useFavorites();
  const router = useRouter();

  // Ref for the sentinel element (for infinite scrolling)
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection observer for infinite scrolling
  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
  }, [hasMore, isLoadingMore, loadMore]);

  // Connect observer when component mounts or when dependencies change
  useEffect(() => {
    setupObserver();
    // Cleanup observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupObserver, favoritesState.favorites.length]);

  if (isLoading) {
    return <FavoriteSkeleton />
  }

  const favoriteGroups = groupItemsByDate(
    favoritesState.favorites,
    (favorite) => favorite.createdAt
  );
  const groupKeys = sortDateGroupKeys(Object.keys(favoriteGroups));

  return (
    <div className="px-6 md:px-24 py-8 pb-32 md:pb-48 md:py-16">
      <div className="hidden md:flex gap-6 items-center">
        <Button
          variant="outline"
          className="rounded-full active:scale-95 px-4 py-6 border-none group"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
        </Button>
        <h1 className="text-3xl font-semibold">Recently Favorites</h1>
      </div>
      <div className="mt-0 md:mt-10 ps-0 md:ps-20">
        {groupKeys.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No favorites</div>
        ) : (
          <>
            <div className="space-y-16">
              {groupKeys.map(dateGroup => (
                <div key={dateGroup} className="w-80">
                  <h2 className="text-lg font-semibold mb-6 text-gray-700">{dateGroup}</h2>
                  <div className="space-y-8">
                    {favoriteGroups[dateGroup].map(favorite => (
                      <FavoriteCard
                        key={favorite.id}
                        favorite={favorite}
                        router={router}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Intersection observer target element */}
            <div
              ref={loadMoreRef}
              className="h-10 w-full flex justify-center items-center py-6 mt-8"
            >
              {isLoadingMore ? (
                <LoadingSpinnerMore className="w-6 h-6 md:w-8 md:h-8" />
              ) : hasMore ? (
                <div className="h-4"></div>
              ) : (
                <div className="text-sm text-gray-500">No more favorites</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function FavoriteCard({ favorite, router }: {
  favorite: TypeFavorite
  router: ReturnType<typeof useRouter>;
}) {
  const { toggleLike } = useLike({
    postId: favorite.post.id,
    likes: [{
      userId: favorite.user.id,
    }] as Like[]
  });
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(true);

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(false);
    setTimeout(() => {
      toggleLike();
    }, 600);
  };

  return (
    <div
      onClick={() => router.push(`/find/${favorite.post.user.name}/${favorite.post.title}/${favorite.post.id}`)}
      className="h-full group cursor-pointer transition-all duration-200 hover:translate-y-[-4px] active:scale-[0.98]">
      <div className="border border-gray-300 rounded-2xl shadow-md group-hover:shadow-lg transition-shadow duration-200">
        <div className="relative w-full aspect-square">
          <div className="relative aspect-square w-full">
            <LazyPostImage
              src={favorite.post.coverPhoto || "/placeholder-image.jpg"}
              alt={`Post image ${favorite.post.id}`}
              className="rounded-xl object-cover"
              onLoadingChange={setIsImageLoading}
            />

            {/* Subtle overlay that appears when unfavorited */}
            <AnimatePresence>
              {!isFavorited && (
                <motion.div
                  className="absolute inset-0 bg-black/5 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Heart button with transition */}
          <Button
            onClick={handleLikeToggle}
            className="absolute top-2 right-2 p-2 bg-white/30 backdrop-blur-md rounded-xl border border-white/20
              hover:bg-white/40 active:scale-95 transition-all duration-200 py-6 md:py-4"
            aria-label="Unlike post"
          >
            <motion.div
              animate={{
                scale: isFavorited ? 1 : [1, 0.8, 1],
                rotate: isFavorited ? 0 : [0, -5, 5, 0],
              }}
              transition={{ duration: 0.4 }}
            >
              <Heart
                className={`w-8 h-8 md:w-5 md:h-5 transition-all duration-300 ${isFavorited
                  ? "fill-yellow-500 stroke-yellow-500"
                  : "fill-none stroke-gray-500"
                  }`}
              />
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col justify-between mt-3">
        {isImageLoading ? (
          <TextSkeleton width="w-3/4" height="h-4" />
        ) : (
          <p className="text-sm font-medium">{favorite.post.title}</p>
        )}
        <div className="flex gap-2 mt-1 items-center">
          {isImageLoading ? (
            <>
              <TextSkeleton width="w-1/2" height="h-4" />
              <TextSkeleton width="w-1/3" height="h-4" />
            </>
          ) : (
            <>
              <span className="text-sm text-gray-500 flex gap-1 items-center min-w-max">
                <MapPin className="w-4 h-4 inline-block" />
                {favorite.post.location?.city}, {favorite.post.location?.country === "Pilipinas" ? "Philippines" : favorite.post.location?.country}
              </span>
              <span className={`flex items-center gap-1 text-gray-800 text-sm font-medium transition-opacity duration-200 
                ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}>
                {favorite.post.averageRating && <Star className="w-4 h-4 text-gray-500 fill-gray-500" />}
                {favorite.post.averageRating}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
