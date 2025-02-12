"use client";

import { PostPage } from "@/hooks/posts/usePosts";
import { InfiniteData } from "@tanstack/react-query";
import { motion } from 'framer-motion'
import { PostWithUserInfo } from "@repo/types";
import { PricingType } from "@prisma/client/edge";
import { memo, useCallback, useMemo, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots } from "@repo/ui/components/ui/carousel";
import { Heart, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { LazyAvatarImage, LazyPostImage } from "../lazyImage";
import { differenceInDays } from "date-fns";
import { formatPrice } from "@/lib/postUtils";
import { useLike } from "@/hooks/posts/useLike";

interface PostsGridProps {
  postsData: InfiniteData<PostPage> | undefined
  isLoading: boolean
  error: Error | null
  hasNextPage: boolean | undefined
  isFetchingNextPage: boolean
  onLoadMore: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const PostsGrid = memo(function PostsGrid({
  postsData,
  isLoading,
  error,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore
}: PostsGridProps) {
  const allPosts = useMemo(() =>
    postsData?.pages.flatMap((page: PostPage) =>
      Array.isArray(page.posts) ? page.posts : page.posts.posts
    ) || [],
    [postsData]
  );

  if (!postsData) {
    return <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 mx-auto"
    >
      <PostsGridSkeleton />
    </motion.div>
  }

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
        variants={containerVariants}
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
});

export const PostCard = memo(function PostCard({
  post,
  isFeatured
}: {
  post: (PostWithUserInfo & {
    distance: number | null
  }),
  isFeatured?: boolean
}) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const { isLiked, toggleLike } = useLike({
    postId: post.id,
    likes: post.likes
  });
  const router = useRouter();

  const allImages = useMemo(() =>
    [...(post.media?.map(m => m.url) || [])].filter(Boolean),
    [post.media]
  );

  const isNewPost = useMemo(() =>
    differenceInDays(new Date(), post.createdAt) <= 21,
    [post.createdAt]
  );

  const handleClick = useCallback(() => {
    if (!isImageLoading && !isAvatarLoading) {
      router.push(`/find/${post.user.name}/${post.title}/${post.id}`);
    }
  }, [isImageLoading, isAvatarLoading, router, post.user.name, post.title, post.id]);

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

            {/*New post badge that has ratings and reviews*/}
            {!isImageLoading && isNewPost && (
              <div className="absolute top-2 left-2">
                <div className="relative">
                  <div className="py-1 px-4 rounded-lg shadow-2xl bg-gradient-to-r from-amber-500 to-amber-600 
                    backdrop-blur-md bg-opacity-60 border border-white/20">
                    <p className="capitalize font-semibold text-white text-sm tracking-wide">New!</p>
                  </div>
                  <div className="absolute -inset-0.5 bg-amber-300/20 rounded-lg blur-xl opacity-50"></div>
                </div>
              </div>
            )}
          </Carousel>
          {!isFeatured && (
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
                  <>
                    {post.averageRating && '⭐'} {post.averageRating}
                  </>
                </span>
              )}
            </div>
          )}
          {/* Heart button */}
          <Button
            onClick={toggleLike}
            className="absolute top-2 right-2 p-2 bg-white/30 backdrop-blur-md rounded-xl border border-white/20
              hover:bg-white/40 active:scale-95 transition-all duration-200"
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <Heart className={`w-5 h-5 ${isLiked
              ? 'fill-yellow-500 stroke-yellow-500'
              : 'fill-white stroke-none'
              } transition-colors duration-200`} />
          </Button>
        </div>
      </div>
      {/* Content Section */}
      <div className={`flex flex-col justify-between ${isFeatured ? 'pt-4' : 'mt-8'} px-2`}>
        {(isAvatarLoading && isImageLoading) || isImageLoading ? (
          <TextSkeleton width="w-3/4" height="h-4" />
        ) : (
          <p className="text-sm font-medium">{post.title}</p>
        )}
        <div className="flex flex-col space-y-0.5 mt-2">
          {(isAvatarLoading && isImageLoading) || isImageLoading ? (
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
                  : ""}
              </span>
            </>
          )}
        </div>
        <div className="text-gray-800 text-sm truncate space-x-1 mt-2">
          {(isAvatarLoading && isImageLoading) || isImageLoading ? (
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
});

PostsGrid.displayName = 'PostsGrid';
PostCard.displayName = 'PostCard';

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
