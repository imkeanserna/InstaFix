"use client";

import { PostPage } from "@/hooks/posts/usePosts";
import { InfiniteData } from "@tanstack/react-query";
import { motion } from 'framer-motion'
import { PostWithUserInfo } from "@repo/types";
import { PricingType } from "@prisma/client/edge";
import Image from "next/image";
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots } from "@repo/ui/components/ui/carousel";
import { Heart, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";

interface PostsGridProps {
  postsData: InfiniteData<PostPage> | undefined
  isLoading: boolean
  error: Error | null
  hasNextPage: boolean | undefined
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
  if (!postsData) {
    return <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 mx-auto"
    >
      <PostsGridSkeleton />
    </motion.div>
  }

  const allPosts = postsData?.pages.flatMap((page: any) =>
    Array.isArray(page.posts) ? page.posts : page.posts.posts
  ) || []

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  if (isLoading || isFetchingNextPage || error) {
    return <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 mx-auto"
    >
      <PostsGridSkeleton />
    </motion.div>
  }

  if (allPosts.length === 0) {
    return <div className="text-center p-8 text-gray-500">
      No posts found
    </div>
  }

  return (
    <div className="space-y-6 mx-auto">
      <motion.div
        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-12 md:gap-6"
        variants={container}
        initial="hidden"
        animate="show"
        viewport={{ once: true }}
      >
        {allPosts.map((post: (PostWithUserInfo & {
          distance: number | null
        }), index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.2,
              type: "spring",
              damping: 30,
              stiffness: 250
            }}
            className="h-full"
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </motion.div>

      {hasNextPage && (
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: allPosts.length * 0.1 + 0.3 }}
        >
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load more'}
          </button>
        </motion.div>
      )}
    </div>
  )
}

function PostCard({ post }: {
  post: (PostWithUserInfo & {
    distance: number | null
  })
}) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const allImages = [
    ...(post.media?.map(m => m.url) || [])
  ].filter(Boolean);
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const handleClick = () => {
    if (!isImageLoading && !isAvatarLoading) {
      router.push(`/find/${post.user.name}/${post.title}`);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    // Notify the backend here!
  };

  return (
    <div className="h-full group cursor-pointer transition-all duration-200 hover:translate-y-[-4px] active:scale-[0.98]"
      onClick={handleClick}
    >
      <div className="border border-gray-300 rounded-2xl group-hover:shadow-lg transition-shadow duration-200">
        <div className="relative w-full aspect-square">
          <Carousel className="w-full rounded-xl overflow-hidden">
            <CarouselContent className="-ml-0">
              {allImages.map((imageUrl, index) => (
                <CarouselItem key={index} className="pl-0">
                  <div className="relative aspect-square w-full">
                    <LazyPostImage
                      src={imageUrl}
                      alt={`Post image ${index + 1}`}
                      className="rounded-xl object-cover"
                      onLoadingChange={index === 0 ? setIsImageLoading : undefined}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {allImages.length > 1 && (
              <div onClick={(e) => e.stopPropagation()}>
                <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            <CarouselDots className="absolute bottom-3 left-1/2 transform -translate-x-1/2" />
          </Carousel>
          <div className="flex justify-between absolute bottom-[-1.6rem] left-2 w-full pe-3">
            <div className="flex items-end space-x-2">
              <div className="h-12 w-12 border-[3px] border-white rounded-full relative shadow-sm">
                <LazyAvatarImage
                  src={post.user.image || "/placeholder-avatar.jpg"}
                  alt={post.user.name || "User Avatar"}
                  className="rounded-full object-cover"
                  onLoadingChange={setIsAvatarLoading}
                />
              </div>
              {isAvatarLoading || isImageLoading ? (
                <TextSkeleton width="w-20" height="h-3" />
              ) : (
                <p className={`font-semibold text-gray-800 text-xs truncate capitalize mb-1 transition-opacity duration-200
                ${isAvatarLoading || isImageLoading ? 'opacity-0' : 'opacity-100'}`}>
                  {post.user.name || "Unknown User"}
                </p>
              )}
            </div>
            {isAvatarLoading || isImageLoading ? (
              <div className="flex items-end">
                <TextSkeleton width="w-8" height="h-4" />
              </div>
            ) : (
              <span className={`flex items-end space-x-1 text-gray-800 text-sm transition-opacity duration-200 font-medium
              ${isAvatarLoading || isImageLoading ? 'opacity-0' : 'opacity-100'}`}>
                ⭐ 9.5
              </span>
            )}
          </div>
          {/* Heart button */}
          <Button
            onClick={handleLikeClick}
            className="absolute top-2 right-2 p-2 bg-white/30 backdrop-blur-md rounded-xl border border-white/20
              hover:bg-white/40 active:scale-95 transition-all duration-200"
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <Heart className={`w-5 h-5 ${isLiked
              ? 'fill-yellow-500 stroke-yellow-500'
              : 'fill-white stroke-none hover:fill-yellow-500'
              } transition-colors duration-200`} />
          </Button>
        </div>
      </div>
      {/* Content Section */}
      <div className="flex flex-col justify-between mt-8 px-2">
        {isAvatarLoading || isImageLoading ? (
          <TextSkeleton width="w-3/4" height="h-4" />
        ) : (
          <p className="text-sm font-medium">{post.title}</p>
        )}
        <div className="flex flex-col space-y-0.5 mt-2">
          {isAvatarLoading || isImageLoading ? (
            <>
              <TextSkeleton width="w-1/2" height="h-4" />
              <TextSkeleton width="w-1/3" height="h-4" />
            </>
          ) : (
            <>
              <span className="text-sm text-gray-500 flex gap-1">
                <MapPin className="w-4 h-4 inline-block" />
                {post.location?.city}, {post.location?.country === "Pilipinas" ? "Philippines" : post.location?.country}
              </span>
              <span className="text-sm text-gray-500 flex gap-1">
                {post.distance
                  ? `${Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(post.distance)} kilometers away`
                  : "N/A"}
              </span>
            </>
          )}
        </div>
        <div className="text-gray-800 text-sm truncate space-x-1 mt-2">
          {isAvatarLoading || isImageLoading ? (
            <TextSkeleton width="w-16" height="h-4" />
          ) : (
            <>
              <span className="font-semibold">
                ${formatPrice(post.hourlyRate || post.fixedPrice || 0)}
              </span>
              <span>{post.pricingType === PricingType.HOURLY ? "hour" : "fixed"}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const LazyPostImage = ({ src, alt, className = "", onLoadingChange }: {
  src: string
  alt: string
  className?: string
  onLoadingChange?: (loading: boolean) => void
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadingChange?.(false);
  };

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
          <div className="h-full w-full bg-gray-300 rounded-md" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleLoad}
      />
    </div>
  );
};

const LazyAvatarImage = ({ src, alt, className = "", onLoadingChange }: {
  src: string
  alt: string
  className?: string
  onLoadingChange?: (loading: boolean) => void
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadingChange?.(false);
  };

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="48px"
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleLoad}
      />
    </div>
  );
};

const TextSkeleton = ({ width = "w-24", height = "h-4" }: { width?: string, height?: string }) => (
  <div className={`${width} ${height} bg-gray-200 animate-pulse rounded-md`} />
);

const PostCardSkeleton = () => {
  return (
    <div className="h-full">
      {/* Cover Photo Skeleton */}
      <div className="border border-gray-300 rounded-2xl">
        <div className="relative w-full aspect-square">
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />

          {/* Avatar and Name Section */}
          <div className="flex justify-between absolute bottom-[-1.6rem] left-2 w-full pe-3">
            <div className="flex items-end space-x-1">
              {/* Avatar Skeleton */}
              <div className="h-12 w-12 border-[3px] border-white rounded-full relative">
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
              </div>
              {/* Name Skeleton */}
              <div className="w-20 h-3 bg-gray-200 animate-pulse rounded mb-1" />
            </div>
            {/* Rating Skeleton */}
            <div className="flex items-end">
              <div className="w-8 h-4 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="flex flex-col justify-between mt-8 px-2">
        {/* Title Skeleton */}
        <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded" />

        {/* Location and Distance Skeleton */}
        <div className="flex flex-col space-y-0.5 mt-2">
          <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded" />
          <div className="w-1/3 h-4 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* Price Skeleton */}
        <div className="mt-2">
          <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
};

const PostsGridSkeleton = () => {
  return (
    <div
      className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6"
    >
      {Array.from({ length: 12 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: index * 0.2,
            type: "spring",
            damping: 30,
            stiffness: 250
          }}
          className="h-full"
        >
          <PostCardSkeleton key={index} />
        </motion.div>
      ))}
    </div>
  );
};
