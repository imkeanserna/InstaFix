"use client";

import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import Confetti from 'react-confetti';
import { useEffect, useRef, useState } from "react";
import { Divider } from "./postContent";
import { Award, Clock, Crown, Grip, Loader2, MapPin, PartyPopper, Rocket, Sparkles, Star, Trophy, X } from "lucide-react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { useReviews } from "@/hooks/posts/useReviews";
import { TypedReview } from "@repo/types";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { RenderStars } from "./userSkillRating";
import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Review } from "@prisma/client/edge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@repo/ui/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useMediaQuery } from "@/hooks/useMedia";

interface RatingSectionProps {
  rate: number | null;
  reviews: Review[];
  isLoading: boolean;
  createdAt: Date;
}

export function RatingSection({
  rate,
  reviews,
  isLoading,
  createdAt,
}: RatingSectionProps) {
  const isNewProfile = differenceInDays(new Date(), createdAt) <= 21;
  const showRatingsAndReviews = rate && rate > 0;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({
          width: offsetWidth,
          height: offsetHeight
        });
      }
    };

    // Initial dimensions
    updateDimensions();

    // Update dimensions on window resize
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (isLoading) {
    return <RatingSectionSkeleton />;
  }

  if (isNewProfile && !showRatingsAndReviews) {
    return (
      <div className="w-full relative" ref={containerRef}>
        <Divider marginY="my-6 sm:my-10" />
        <div className="flex flex-col py-6 sm:py-10 items-center text-center group relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            <PartyPopper className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 animate-bounce" />
          </div>

          <div className="relative">
            <p className="text-5xl sm:text-7xl font-semibold bg-clip-text text-transparent group-hover:scale-105 transition-transform bg-gradient-to-br from-amber-500 to-amber-700">
              New
            </p>
            <Sparkles className="absolute -top-4 -right-6 sm:-right-8 w-4 h-4 sm:w-6 sm:h-6 text-amber-400" />
            <Sparkles className="absolute -top-4 -left-6 sm:-left-8 w-4 h-4 sm:w-6 sm:h-6 text-amber-400" />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Rocket className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-medium cursor-pointer transition-colors text-gray-600 hover:text-amber-600">
              Rising Star
            </p>
          </div>

          <div className="mt-4 sm:mt-6 max-w-lg p-3 sm:p-4 bg-amber-50/50 rounded-xl border border-amber-100">
            <p className="text-xs sm:text-sm text-gray-700">
              {`Book now for your very first experience! Don't miss out on exciting opportunities.`}
            </p>
          </div>
        </div>
        <Divider marginY="my-6 sm:my-10" />
      </div>
    );
  }

  return (
    <div className="w-full relative" ref={containerRef}>
      {containerRef && rate && rate >= 4.5 && (
        <div className="absolute inset-0 overflow-hidden">
          <Confetti
            width={dimensions.width}
            height={dimensions.height}
            recycle={true}
            numberOfPieces={100}
            gravity={0.2}
            colors={['#FCD34D', '#FBBF24', '#F59E0B', '#D97706']}
          />
        </div>
      )}
      <Divider marginY="my-6 sm:my-10" />
      <div className="flex flex-col-reverse md:flex-row justify-center items-center gap-8 md:gap-20">
        <RatingBars reviews={reviews} isLoading={isLoading} />
        <div className="hidden md:block w-px h-56 bg-gradient-to-b from-transparent via-amber-200 to-transparent"></div>
        <div className="w-full md:w-[400px] text-center space-y-4">
          {!isNewProfile
            ?
            <>
              {showRatingsAndReviews
                ?
                <>
                  <div className="flex flex-col items-center gap-2">
                    {getRatingIcon(rate)}
                    <p className="text-7xl md:text-9xl font-medium text-yellow-500 flex items-center gap-2">
                      {rate}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg md:text-xl font-semibold flex items-center justify-center gap-2">
                      Professional Choice
                      <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      This freelancer is a trusted choice, recognized for expertise, reliability, and top ratings.
                    </p>
                  </div>
                </>
                :
                <>
                  <div className="flex flex-col items-center gap-4 p-4 md:p-6">
                    <p className="text-2xl md:text-3xl font-semibold bg-clip-text text-transparent group-hover:scale-105 transition-transform bg-gradient-to-br from-amber-500 to-amber-700">
                      No Reviews Yet
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">Be the first to experience and rate this service!</p>
                  </div>
                </>
              }
            </>
            :
            <div className="flex flex-col items-center gap-4 p-4 md:p-6">
              <p className="text-2xl md:text-3xl font-semibold bg-clip-text text-transparent group-hover:scale-105 transition-transform bg-gradient-to-br from-amber-500 to-amber-700">
                No Reviews Yet
              </p>
              <p className="text-xs md:text-sm text-gray-500">Be the first to experience and rate this service!</p>
            </div>
          }
        </div>
      </div>
      <Divider marginY="my-6 sm:my-10" />
    </div>
  );
};

type RatingCounts = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
};

export function RatingBars({ reviews, isLoading }: {
  reviews: Review[];
  isLoading?: boolean;
}) {
  const ratings = reviews.reduce<RatingCounts>((acc, review) => {
    const rating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5; // Round to nearest integer
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  });

  const totalReviews = reviews.length;
  const maxCount = Math.max(...Object.values(ratings));

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  if (isLoading) {
    return <RatingBarsSkeleton />;
  }

  const barVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const countVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, delay: 0.8 }
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-none" ref={ref}>
      <CardHeader className="p-3 md:p-4">
        <motion.p
          className="text-xs md:text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {totalReviews} total reviews
        </motion.p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((rating, index) => {
            const count = ratings[rating as 1 | 2 | 3 | 4 | 5] || 0;
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-2 md:gap-3">
                <motion.span
                  className="text-xs md:text-sm"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {rating}
                </motion.span>
                <div className="relative h-1.5 md:h-2 flex-1 bg-gray-200 rounded overflow-hidden">
                  <motion.div
                    className="absolute h-1.5 md:h-2 bg-yellow-500 rounded origin-left"
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={barVariants}
                    style={{
                      width: `${percentage}%`
                    }}
                    custom={index}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                  />
                </div>
                <motion.span
                  className="w-6 md:w-8 text-xs md:text-sm text-start text-gray-500"
                  variants={countVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  transition={{ delay: index * 0.1 + 0.8 }}
                >
                  {ratings[rating as 1 | 2 | 3 | 4 | 5]}
                </motion.span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ReviewSection({
  postId,
  reviews,
  rate
}: {
  rate: number | null;
  postId: string;
  reviews: Review[]
}) {
  const {
    data: reviewData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useReviews(postId, 10);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  if (isLoading || isFetchingNextPage || error || !reviewData) {
    return <ReviewSectionSkeleton />;
  }

  const allReviews = reviewData.pages.flatMap((page) =>
    Array.isArray(page.reviews) ? page.reviews : page.reviews.reviews
  );

  const displayedReviews = allReviews.slice(0, 6);
  const totalReviews = allReviews.length;

  return (
    <div className="space-y-6 lg:px-60">
      <p className="text-2xl font-medium">{totalReviews} reviews</p>

      {/* Desktop View - Grid Layout */}
      <div className="hidden md:grid grid-cols-2 gap-8">
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} typeLocation="shortLocation" />
        ))}
      </div>

      {/* Mobile View - Carousel Layout */}
      <div className="block md:hidden">
        <Carousel
          plugins={[plugin.current]}
          className="w-full relative"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2">
            {displayedReviews.map((review) => (
              <CarouselItem key={review.id} className="pl-2 basis-[80%]">
                <div className="p-1">
                  <ReviewCard review={review} typeLocation="shortLocation" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute top-0 right-0 h-full w-[20%] bg-gradient-to-l from-white via-white/50 to-transparent pointer-events-none" />
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>

      <div className="py-4">
        {(isMobile || totalReviews > 6) && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline"
                className="w-full md:w-auto px-4 text-sm py-6 rounded-xl font-medium hover:bg-yellow-400 border border-gray-900 active:scale-95 transition-all"
              >
                <Grip className="h-4 w-4 mr-2" />
                Show all {totalReviews} reviews
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-full md:h-[90vh] py-8">
              <DialogClose className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </DialogClose>
              {isFetchingNextPage ? (
                <ReviewDialogSkeleton />
              ) : (
                <>
                  <div className="flex flex-col-reverse md:flex-row justify-center items-center gap-8">
                    <RatingBars reviews={reviews} />
                    <div className="hidden md:block w-px h-56 bg-gradient-to-b from-transparent via-amber-200 to-transparent"></div>
                    <div className="w-full md:w-[400px] text-center space-y-4">
                      <div className="flex flex-col items-center gap-2">
                        {getRatingIcon(rate)}
                        <p className="text-6xl font-medium text-yellow-500 flex items-center gap-2">
                          {rate}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold flex items-center justify-center gap-2">
                          Professional Choice
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        </p>
                        <p className="text-xs text-gray-500">
                          This freelancer is a trusted choice, recognized for expertise, reliability, and top ratings.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-6 px-4 md:px-20 py-10">
                      <p className="text-2xl font-medium">{totalReviews} reviews</p>
                      {allReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} typeLocation="longLocation" />
                      ))}
                      {hasNextPage && (
                        <LoadMoreButton
                          onClick={() => fetchNextPage()}
                          isFetchingNextPage={isFetchingNextPage}
                          hasNextPage={hasNextPage}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export function ReviewCard({ review, typeLocation }: {
  review: TypedReview
  typeLocation: 'shortLocation' | 'longLocation'
}) {
  const memberDuration = formatDistanceToNow(review.user.createdAt);
  const reviewAge = formatDistanceToNow(review.createdAt);

  const formatLocation = (location: { fullAddress: string }) => {
    const parts = location.fullAddress.split(',').map(part => part.trim());
    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1]}${parts.length > 2 ? '...' : ''}`;
    }
    return location.fullAddress;
  };

  return (
    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-amber-100 via-amber-50 to-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-amber-200/50">
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-amber-300 ring-offset-2 shadow-md">
            <AvatarImage
              src={review.user?.image || ''}
              alt={`${review.user.name}'s avatar`}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-amber-200 to-yellow-300 text-amber-800 text-2xl font-medium">
              {review.user.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="w-full">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900 capitalize">{review.user.name}</p>
              {review.user.location && (
                <div className="flex items-center gap-1.5 justify-end text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-xs font-medium">
                    {typeLocation === 'shortLocation'
                      ? formatLocation(review.user.location)
                      : review.user.location.fullAddress}
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600">{memberDuration} on Instafix</p>
          </div>
        </div>
        <div className="flex gap-2 text-sm items-center">
          <div className="flex drop-shadow-sm">
            {RenderStars(review.rating, "w-3 h-3")}
          </div>
          <div className="h-1 w-1 bg-amber-300 rounded-full"></div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-xs font-medium">{reviewAge} ago</p>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
    </div>
  );
}

export const getRatingIcon = (rating: number | null) => {
  if (!rating) return null;
  if (rating >= 4.8) return <Crown className="text-yellow-500 w-12 h-12 animate-pulse" />;
  if (rating >= 4.5) return <Trophy className="text-yellow-500 w-12 h-12" />;
  if (rating >= 4.0) return <Award className="text-yellow-500 w-12 h-12" />;
  return <Star className="text-yellow-500 w-12 h-12" />;
};

interface LoadMoreButtonProps {
  onClick: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onClick,
  isFetchingNextPage,
  hasNextPage
}) => {
  if (!hasNextPage) return null;

  return (
    <Button
      onClick={onClick}
      disabled={isFetchingNextPage}
      variant="outline"
      className="w-full py-6 rounded-xl font-medium hover:bg-yellow-400 border border-gray-900 active:scale-95 transition-all"
    >
      {isFetchingNextPage ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading more...
        </>
      ) : (
        'Load more reviews'
      )}
    </Button>
  );
};

function ReviewCardSkeleton() {
  return (
    <div className="space-y-2 p-4 rounded-xl bg-white shadow-lg border border-gray-200 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          {/* Avatar skeleton */}
          <div className="h-12 w-12 rounded-full bg-gray-200" />
          <div className="w-full">
            <div className="flex items-center justify-between">
              {/* Name skeleton */}
              <div className="h-4 w-32 bg-gray-200 rounded" />
              {/* Location skeleton */}
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            </div>
            {/* Member duration skeleton */}
            <div className="h-3 w-24 bg-gray-200 rounded mt-1" />
          </div>
        </div>
        {/* Rating and time skeleton */}
        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 w-3 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-1 w-1 bg-gray-200 rounded-full" />
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
      {/* Comment skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function ReviewSectionSkeleton() {
  return (
    <div className="space-y-6 px-60">
      <div className="grid grid-cols-2 gap-8">
        {[...Array(6)].map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
      <div className="py-8 flex justify-start">
        {/* Show all reviews button skeleton */}
        <div className="h-12 w-48 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export function ReviewDialogSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-center items-center gap-8">
        {/* Rating bars skeleton */}
        <RatingBarsSkeleton />
        {/* Divider */}
        <div className="w-px h-56 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
        {/* Rating summary skeleton */}
        <div className="w-[400px] text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 bg-gray-200 rounded-full" />
            <div className="h-16 w-24 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded mx-auto" />
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto" />
          </div>
        </div>
      </div>
      {/* Reviews list skeleton */}
      <div className="border-t border-gray-200">
        <div className="grid grid-cols-1 gap-6 px-20 py-10">
          {[...Array(3)].map((_, i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function RatingBarsSkeleton() {
  return (
    <Card className="w-full max-w-md border-0 shadow-none animate-pulse">
      <CardHeader className="p-4">
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="relative h-2 flex-1 bg-gray-200 rounded overflow-hidden" />
              <div className="w-8 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RatingSectionSkeleton() {
  return (
    <div className="w-full relative">
      <div className="h-px bg-gray-200 my-10" /> {/* Divider */}
      <div className="flex justify-center items-center gap-20">
        {/* Rating Bars Skeleton */}
        <RatingBarsSkeleton />

        {/* Divider */}
        <div className="w-px h-56 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

        {/* Rating Summary Skeleton */}
        <div className="w-[400px] text-center space-y-4 animate-pulse">
          <div className="flex flex-col items-center gap-2">
            {/* Rating Icon Skeleton */}
            <div className="h-16 w-16 bg-gray-200 rounded-full" />
            {/* Rating Number Skeleton */}
            <div className="h-32 w-32 bg-gray-200 rounded-lg" />
          </div>
          <div className="space-y-2">
            {/* Professional Choice Text Skeleton */}
            <div className="flex items-center justify-center gap-2">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="h-5 w-5 bg-gray-200 rounded" />
            </div>
            {/* Description Skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded mx-auto" />
              <div className="h-4 w-3/4 bg-gray-200 rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>
      <div className="h-px bg-gray-200 my-10" /> {/* Divider */}
    </div>
  );
}
