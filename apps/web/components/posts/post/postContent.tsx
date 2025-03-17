"use client";

import { usePostData } from '@/hooks/posts/usePostData';
import { UserSkillRating } from './userSkillRating';
import { FeaturePosts } from './featurePosts';
import { ServicesIncludes } from './servicesIncludes';
import { PostCalendar } from './calendar';
import { BookingForm } from './bookingForm';
import { useSession } from 'next-auth/react';
import { PostImages, PostImagesSkeleton } from './postGallery';
import { Heart, Star } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { useEffect, useState } from 'react';
import ExpandableDescription from './expandibleDescription';
import { PricingType } from '@prisma/client/edge';
import FreelancerProfileCard from './profileCard';
import { RatingSection, ReviewSection } from './reviewSection';
import { LocationDisplay } from '@/components/ui/locationNavigation';
import { BookingDrawerWrapper } from '@/components/book/bookingDrawer';
import { useSearchParams } from "next/navigation";
import { differenceInDays } from 'date-fns';
import { useLike } from '@/hooks/posts/useLike';

export function PostContent({ postId, username }: {
  postId: string,
  username: string,
}) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const { staticData, dynamicData, isLoading, isError } = usePostData(postId);
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { isLiked, toggleLike } = useLike({
    postId: postId,
    likes: dynamicData?.likes || []
  });

  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setSelectedDate(dateParam);
    } else {
      setSelectedDate("");
    }
  }, [searchParams]);

  if (isLoading || !staticData || !dynamicData || isError) {
    return <PostContentSkeleton />;
  }

  const isNewPost = differenceInDays(new Date(), staticData?.post.createdAt) <= 21;
  const showRatingsAndReviews = dynamicData.reviews.length > 0 && dynamicData.averageRating && dynamicData.averageRating > 0;

  return (
    <div className='w-full'>
      <div className="flex flex-col md:flex-row gap-20 relative">
        {/* Left Side - hidden on tablet and below */}
        <div className='hidden lg:flex w-[600px] sticky top-24 flex-col gap-8 self-start'>
          <FreelancerProfileCard
            name={staticData.post.user.name!}
            avatarUrl={staticData.post.user.image!}
            reviews={dynamicData.reviews.length}
            rating={dynamicData.averageRating || 0}
            monthsHosting={staticData.post.user.createdAt}
            serviceLocation={staticData.post.serviceLocation!}
            audience={staticData.post.targetAudience!}
            engagementType={staticData.post.serviceEngagement[0]}
            createdAt={staticData.post.createdAt}
          />
          {staticData.post.userId !== session?.user?.id && (
            <div className='border border-gray-200 rounded-2xl'>
              <BookingForm
                postId={postId}
                user={session?.user || null}
                rate={dynamicData.pricingType === PricingType.FIXED_PRICE ? dynamicData.fixedPrice || 0 : dynamicData.hourlyRate || 0}
                username={username}
                freelancerId={staticData.post.user.id}
                pricingType={dynamicData.pricingType || PricingType.HOURLY}
              />
            </div>
          )}
        </div>

        {/*Right Side*/}
        <div className="w-full flex flex-col gap-5">
          <div className='flex flex-col'>
            <div className='flex lg:hidden justify-end mb-2'>
              <Button
                onClick={toggleLike}
                className={`group flex items-center gap-2 py-4 px-6
                  bg-white
                  rounded-xl
                  hover:bg-gray-50 
                  active:scale-95 
                  transition-all duration-300
                  hover:shadow-yellow-200/50`}
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <Heart
                  className={`w-5 h-5 ${isLiked
                    ? 'fill-yellow-400 stroke-yellow-400'
                    : 'fill-transparent stroke-yellow-400'
                    } transition-all duration-300`}
                />
                <p className="text-xs text-gray-900 underline group-hover:underline">
                  Save
                </p>
              </Button>
            </div>
            <PostImages media={staticData?.post.media || []} />
            <div className='flex justify-between items-center gap-52'>
              <div className='px-6 md:px-0'>
                <h3 className='text-2xl font-medium mt-8'>
                  {`${staticData?.post.tags[0].subcategory.name} in ${staticData?.post.location?.city} ${staticData?.post.location?.state},
                ${staticData?.post.location?.country === "Pilipinas" ? "Philippines" : staticData?.post.location?.country} (${dynamicData?.title})`}
                </h3>
              </div>
              {staticData.post.userId !== session?.user?.id && (
                <div className='hidden md:flex lg:hidden md:w-auto'>
                  <BookingDrawerWrapper
                    postId={postId}
                    user={session?.user || null}
                    rate={dynamicData.pricingType === PricingType.FIXED_PRICE ? dynamicData.fixedPrice || 0 : dynamicData.hourlyRate || 0}
                    username={username}
                    freelancerId={staticData.post.user.id}
                  />
                </div>
              )}
              <div className='hidden lg:inline'>
                <Button
                  onClick={toggleLike}
                  className={`group flex items-center gap-2 p-4 
                    bg-white
                    rounded-xl
                    hover:bg-gray-50 
                    active:scale-95 
                    transition-all duration-300
                    hover:shadow-yellow-200/50 ${isLiked && 'border border-gray-500'}`}
                  aria-label={isLiked ? "Unlike post" : "Like post"}
                >
                  <Heart
                    className={`w-5 h-5 ${isLiked
                      ? 'fill-yellow-400 stroke-yellow-400'
                      : 'fill-transparent stroke-yellow-400'
                      } transition-all duration-300`}
                  />
                  <p className="text-xs text-gray-900 underline group-hover:underline">
                    Save
                  </p>
                </Button>
              </div>
            </div>
          </div>
          <UserSkillRating
            skills={staticData?.post.skills || []}
            averageRating={dynamicData?.averageRating || 0}
            noOfReviews={dynamicData?.reviews.length || 0}
            createdAt={staticData.post.createdAt}
          />
          <div className='px-6 md:px-0'>
            {staticData?.post.description && <ExpandableDescription
              description={staticData.post.description}
              title='About this service'
            />
            }
            {staticData?.post.experience &&
              <>
                <Divider />
                <div className='space-y-4'>
                  <h3 className="text-2xl font-medium">Experience</h3>
                  <ExpandableDescription
                    description={staticData.post.experience}
                    title='About this service'
                  />
                </div>
              </>
            }
            <Divider />
            <ServicesIncludes services={staticData?.post.servicesIncluded || []} />
            <Divider />
            <PostCalendar
              postId={postId}
              user={session?.user || null}
            />
            <Divider />
            <FeaturePosts
              highlightsPosts={staticData.highlightsPosts || []}
              name={staticData.post.user.name!}
            />
          </div>
        </div>
      </div>
      <div className='mt-24 pb-36 md:pb-0'>
        <div className='px-6 md:px-0'>
          <RatingSection
            rate={dynamicData.averageRating}
            reviews={dynamicData.reviews}
            isLoading={isLoading}
            createdAt={staticData.post.createdAt}
          />
          {dynamicData.reviews.length > 0 &&
            <>
              <div className='mt-16 mb-8'>
                <ReviewSection
                  postId={postId}
                  rate={dynamicData.averageRating}
                  reviews={dynamicData.reviews}
                />
              </div>
              <Divider />
            </>
          }

          {/*Show the freelancer card in the tablet and mobile view*/}
          <div className="md:hidden w-full mb-8">
            <div className='py-6 space-y-6'>
              <h3 className='text-2xl font-medium'>
                Meet your freelancer
              </h3>
              <div className="px-4 md:px-8">
                <FreelancerProfileCard
                  name={staticData.post.user.name!}
                  avatarUrl={staticData.post.user.image!}
                  reviews={dynamicData.reviews.length}
                  rating={dynamicData.averageRating || 0}
                  monthsHosting={staticData.post.user.createdAt}
                  serviceLocation={staticData.post.serviceLocation!}
                  audience={staticData.post.targetAudience!}
                  engagementType={staticData.post.serviceEngagement[0]}
                  createdAt={staticData.post.createdAt}
                />
              </div>
            </div>
            <Divider />
          </div>
          <div className='lg:px-60 md:py-12'>
            <LocationDisplay
              freelancerName={staticData.post.user.name!}
              freelancerImage={staticData.post.user.image!}
              location={{
                address: staticData.post.location?.fullAddress || "",
                lat: staticData.post.location?.latitude || 0,
                lng: staticData.post.location?.longitude || 0
              }}
              maptilerKey={process.env.MAPTILER_API_KEY}
            />
          </div>
        </div>
      </div>
      <div className="bg-white fixed flex justify-between items-start border-t border-gray-200 md:hidden bottom-0 w-full z-10 py-4 px-6">
        <div className='space-y-1'>
          <p className='text-sm'>{selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : "Add dates for availability"}</p>
          <div className='flex items-center gap-1'>
            <Star className='w-3 h-3 fill-gray-900' />
            {isNewPost && !showRatingsAndReviews
              ?
              <p className="text-xs">New</p>
              :
              (dynamicData.averageRating && dynamicData.averageRating > 0)
                ?
                <p className="text-xs">{dynamicData.averageRating.toFixed(1)}</p>
                :
                <p className="text-xs">No reviews yet</p>
            }
          </div>
        </div>
        <div className='w-[200px]'>
          {staticData.post.userId !== session?.user?.id && (
            <BookingDrawerWrapper
              postId={postId}
              user={session?.user || null}
              rate={dynamicData.pricingType === PricingType.FIXED_PRICE ? dynamicData.fixedPrice || 0 : dynamicData.hourlyRate || 0}
              username={username}
              freelancerId={staticData.post.user.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function PostContentSkeleton() {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-20 relative">
        {/* Left Side - Booking Form Skeleton - hidden on mobile/tablet */}
        <div className="hidden lg:flex w-[600px] h-screen sticky top-0 flex-col gap-8">
          {/* Freelancer Profile Card Skeleton */}
          <div className="w-full h-[400px] bg-muted animate-pulse rounded-2xl" />
          {/* Booking Form Skeleton */}
          <div className="w-full h-[300px] bg-muted animate-pulse rounded-2xl border border-gray-200" />
        </div>

        {/* Right Side */}
        <div className="w-full flex flex-col gap-5">
          {/* Mobile Save Button Skeleton */}
          <div className="flex lg:hidden justify-end mb-2">
            <div className="h-12 w-24 bg-muted animate-pulse rounded-xl" />
          </div>

          {/* Images Skeleton */}
          <PostImagesSkeleton />

          <div className="flex justify-between items-center gap-4 md:gap-52 px-6 md:px-0">
            {/* Title Skeleton */}
            <div className="h-8 w-full md:w-3/4 bg-muted animate-pulse rounded-md" />

            {/* Desktop Save Button Skeleton */}
            <div className="hidden lg:block h-12 w-24 bg-muted animate-pulse rounded-xl" />
          </div>

          {/* User Skill Rating Skeleton */}
          <div className="h-12 w-full bg-muted animate-pulse rounded-md" />

          <div className="px-6 md:px-0 space-y-6">
            {/* Description Skeleton */}
            <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />

            {/* Experience Section Skeleton */}
            <div className="space-y-4">
              <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
              <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />
            </div>

            {/* Services Includes Skeleton */}
            <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />

            {/* Calendar Skeleton */}
            <div className="h-96 w-full bg-muted animate-pulse rounded-lg" />

            {/* Feature Posts Skeleton */}
            <div className="space-y-4">
              <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="h-[200px] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Sections */}
      <div className="mt-24 pb-36 md:pb-0">
        <div className="px-6 md:px-0">
          {/* Rating Section Skeleton */}
          <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />

          {/* Mobile Freelancer Card Skeleton */}
          <div className="md:hidden w-full my-8">
            <div className="py-6 space-y-6">
              <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
              <div className="px-4">
                <div className="h-[400px] w-full bg-muted animate-pulse rounded-2xl" />
              </div>
            </div>
          </div>

          {/* Location Display Skeleton */}
          <div className="lg:px-60 md:py-12">
            <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar Skeleton */}
      <div className="fixed md:hidden bottom-0 w-full z-10 py-4 px-6 bg-white border-t border-gray-200">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted animate-pulse rounded-md" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="w-[200px] h-12 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function Divider({ marginY = "my-6", height = "h-[1px]" }: { marginY?: string, height?: string }) {
  return <div className={`${height} bg-gray-200 w-full ${marginY}`}></div>;
}
