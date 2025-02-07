"use client";

import { usePostData } from '@/hooks/posts/usePostData';
import { UserSkillRating } from './userSkillRating';
import { FeaturePosts } from './featurePosts';
import { ServicesIncludes } from './servicesIncludes';
import { PostCalendar } from './calendar';
import { BookingForm } from './bookingForm';
import { useSession } from 'next-auth/react';
import { PostImages, PostImagesSkeleton } from './postGallery';
import { Heart } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { useState } from 'react';
import ExpandableDescription from './expandibleDescription';
import { PricingType } from '@prisma/client/edge';
import FreelancerProfileCard from './profileCard';
import { RatingSection, ReviewSection } from './reviewSection';
import { LocationDisplay } from '@/components/ui/locationNavigation';

export function PostContent({ postId }: { postId: string }) {
  const [isLiked, setIsLiked] = useState(false);
  const { staticData, dynamicData, isLoading, isError } = usePostData(postId);
  const { data: session } = useSession();

  if (isLoading || !staticData || !dynamicData || isError) {
    return <PostContentSkeleton />;
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    // --TODO: Hit the backend server to toggle the like
  };

  return (
    <div className='w-full'>
      <div className="flex gap-20 relative">
        {/*Left Side*/}
        <div className='w-[600px] h-screen sticky top-0 flex flex-col gap-8'>
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
          <BookingForm
            postId={postId}
            user={session?.user || null}
            rate={dynamicData.pricingType === PricingType.FIXED_PRICE ? dynamicData.fixedPrice || 0 : dynamicData.hourlyRate || 0}
          />
        </div>

        {/*Right Side*/}
        <div className="w-full flex flex-col gap-5">
          <div className='flex flex-col gap-6'>
            <PostImages media={staticData?.post.media || []} />
            <div className='flex justify-between items-center gap-52'>
              <h3 className='text-2xl font-medium'>
                {`${staticData?.post.tags[0].subcategory.name} in ${staticData?.post.location?.city} ${staticData?.post.location?.state},
          ${staticData?.post.location?.country === "Pilipinas" ? "Philippines" : staticData?.post.location?.country} (${dynamicData?.title})`}
              </h3>
              <Button
                onClick={handleLikeClick}
                className={`group flex items-center gap-2 p-4 
                    bg-white
                    rounded-xl
                    hover:bg-gray-50 
                    active:scale-95 
                    transition-all duration-300
                    hover:shadow-yellow-200/50 ${isLiked && 'border border-gray-500'} `}
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <Heart
                  className={`w-5 h-5 ${isLiked
                    ? 'fill-yellow-400 stroke-yellow-400 '
                    : 'fill-transparent stroke-yellow-400'
                    } transition-all duration-300`}
                />
                <p className="text-xs text-gray-900 underline group-hover:underline">
                  Save
                </p>
              </Button>
            </div>
          </div>
          <UserSkillRating
            skills={staticData?.post.skills || []}
            averageRating={dynamicData?.averageRating || 0}
            noOfReviews={dynamicData?.reviews.length || 0}
            createdAt={staticData.post.createdAt}
          />
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
      <div className='mt-24'>
        <RatingSection
          rate={dynamicData.averageRating}
          reviews={dynamicData.reviews}
          isLoading={isLoading}
          createdAt={staticData.post.createdAt}
        />
        {dynamicData.reviews.length > 0 &&
          <>
            <div className='mt-16'>
              <ReviewSection
                postId={postId}
                rate={dynamicData.averageRating}
                reviews={dynamicData.reviews}
              />
            </div>
            <Divider />
          </>
        }
        <div className='px-60 py-12'>
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
  );
}

export function PostContentSkeleton() {
  return (
    <div className="flex gap-8">
      {/*Left Side - Booking Form Skeleton*/}
      <div className='w-[700px] h-[500px]'>
        <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
      </div>

      {/*Right Side*/}
      <div className="w-full flex flex-col gap-4">
        {/* Title Skeleton */}
        <div className="h-8 w-3/4 bg-muted animate-pulse rounded-md" />

        {/* Images Skeleton */}
        <PostImagesSkeleton />

        {/* Location Skeleton */}
        <div className="h-6 w-1/2 bg-muted animate-pulse rounded-md" />

        {/* User Skill Rating Skeleton */}
        <div className="h-12 w-full bg-muted animate-pulse rounded-md" />

        {/* Feature Posts Title Skeleton */}
        <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />

        {/* Feature Posts Grid Skeleton */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 
              md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-12 md:gap-6"
        >
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="h-[200px] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>

        {/* Services Includes Skeleton */}
        <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />

        {/* Calendar Skeleton */}
        <div className="h-96 w-full bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

export function Divider({ marginY = "my-6" }: { marginY?: string }) {
  return <div className={`h-[1px] bg-gray-200 w-full ${marginY}`}></div>;
}
