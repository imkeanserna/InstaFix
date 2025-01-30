"use client";

import { usePostData } from '@/hooks/posts/usePostData';
import { Media } from '@prisma/client/edge';
import { Button } from '@repo/ui/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@repo/ui/components/ui/dialog';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserSkillRating } from './userSkillRating';
import { FeaturePosts } from './featurePosts';
import { ServicesIncludes } from './servicesIncludes';
import { motion } from 'framer-motion'
import { PostCard } from '../find/postsCard';
import { PostWithUserInfo } from '@repo/types';
import { PostCalendar } from './calendar';
import { BookingForm } from './bookingForm';

export function PostContent({ postId }: { postId: string }) {
  const { staticData, dynamicData, isLoading, isError } = usePostData(postId);

  if (isLoading) {
    // Skeleton Post here
    return <div>Loading...</div>;
  }

  if (isError) {
    // Skeleton Post here
    return <div>Error loading post</div>;
  }

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

  return (
    <div className="flex gap-8">
      {/*Left Side*/}
      <div className='w-[700px] h-[500px]'>

        <BookingForm postId={postId} />
      </div>

      <div className="w-full flex flex-col gap-4"> {/* Constrained width */}
        <div>
          <p>{dynamicData?.title}</p>
        </div>
        <PostImages media={staticData?.post.media || []} />
        <p>
          {`${staticData?.post.tags[0].subcategory.name} in ${staticData?.post.location?.city} ${staticData?.post.location?.state},
          ${staticData?.post.location?.country === "Pilipinas" ? "Philippines" : staticData?.post.location?.country}`}
        </p>
        <UserSkillRating
          skills={staticData?.post.skills || []}
          averageRating={dynamicData?.averageRating || 0}
          noOfReviews={dynamicData?.reviews.length || 0}
        />
        <FeaturePosts />

        <p>FeaturePosts</p>
        <motion.div
          className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-12 md:gap-6"
          variants={container}
          initial="hidden"
          animate="show"
          viewport={{ once: true }}
        >
          {staticData?.highlightsPosts.map((post: PostWithUserInfo, index: number) => (
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
              <PostCard post={{ ...post, distance: null }} />
            </motion.div>
          ))}
        </motion.div>

        <ServicesIncludes services={staticData?.post.servicesIncluded || []} />
        <PostCalendar />
      </div>
    </div>
  );
}

function PostImages({ media }: { media: Media[] }) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);

  // Filter only image type media
  const images = media.filter(m => m.type === 'IMAGE');
  const hasMoreImages = images.length > 3;
  const displayImages = hasMoreImages ? images.slice(0, 5) : images;

  const ImageGalleryModal = () => (
    <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-y-auto">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.url}
                alt={`Gallery image ${index + 1}`}
                className="rounded-lg"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (images.length === 0) return null;

  return (
    <div className="relative">
      <div className="flex gap-1 h-[500px] rounded-lg overflow-hidden">
        {/* Large left image with full height */}
        {displayImages.length > 0 && (
          <div
            className="w-1/2 h-full relative cursor-pointer"
            onClick={() => setSelectedImage(displayImages[0])}
          >
            <Image
              src={displayImages[0].url}
              alt="Main gallery image"
              className="rounded-lg"
              fill
              style={{ objectFit: 'cover' }}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Right side 2x2 grid */}
        <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-1">
          {displayImages.slice(1, 5).map((image, index) => (
            <div
              key={image.id}
              className="relative h-full cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.url}
                alt={`Gallery image ${index + 2}`}
                className="rounded-lg"
                fill
                style={{ objectFit: 'cover' }}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Overlay for the last image showing remaining count */}
              {hasMoreImages && index === 3 && (
                <div
                  className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening single image modal
                    setShowAllPhotos(true);
                  }}
                >
                  <span className="text-white text-lg font-medium">
                    +{images.length - 5} more
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Show all photos button */}
      {hasMoreImages && (
        <Button
          variant="outline"
          className="absolute bottom-4 right-4 z-10"
          onClick={() => setShowAllPhotos(true)}
        >
          Show all photos
        </Button>
      )}

      {/* Full-screen gallery modal */}
      <ImageGalleryModal />
      {selectedImage && (
        <SingleImageModal
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

const SingleImageModal = ({
  image,
  isOpen,
  onClose
}: {
  image: Media;
  isOpen: boolean;
  onClose: () => void;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-7xl h-[90vh]">
      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogClose>
      <div className="relative w-full h-full">
        <Image
          src={image.url}
          alt="Selected image"
          className="rounded-lg"
          fill
          style={{ objectFit: 'contain' }}
          sizes="90vw"
        />
      </div>
    </DialogContent>
  </Dialog>
);
