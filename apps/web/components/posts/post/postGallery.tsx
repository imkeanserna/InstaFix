"use client";

import { useState } from 'react';
import { Media } from '@prisma/client/edge';
import { Dialog, DialogClose, DialogContent } from '@repo/ui/components/ui/dialog';
import { Grip, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@repo/ui/components/ui/button';
import { LazyPostImage } from '../lazyImage';
import { Carousel, CarouselContent, CarouselCounter, CarouselItem } from '@repo/ui/components/ui/carousel';

export function PostImages({ media }: { media: Media[] }) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const images = media.filter(m => m.type === 'IMAGE');
  const hasMoreImages = images.length > 5;
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
              <LazyPostImage
                src={image.url}
                alt={`Gallery image ${index + 1}`}
                className="rounded-xl object-cover"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Mobile Carousel View
  const MobileCarousel = () => (
    <div className="relative w-full h-[400px]">
      <Carousel className="w-full h-full overflow-hidden">
        <CarouselContent className="-ml-0">
          {images.map((image, index) => (
            <CarouselItem key={index} className="pl-0">
              <div
                className="relative h-full w-full aspect-square cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <LazyPostImage
                  src={image.url}
                  alt={`Gallery image ${index + 1}`}
                  className="object-cover w-full h-full"
                  onLoadingChange={index === 0 ? setIsImageLoading : undefined}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselCounter className="absolute bottom-4 right-4 rounded-lg text-xs font-medium" />
      </Carousel>
    </div>
  );

  // Desktop Grid View
  const DesktopGrid = () => (
    <div className="flex gap-2 h-[500px] rounded-2xl overflow-hidden">
      {/* Large left image with full height */}
      {displayImages.length > 0 && (
        <div
          className="w-1/2 h-full relative cursor-pointer active:scale-[0.99] transition duration-75"
          onClick={() => setSelectedImage(displayImages[0])}
        >
          <LazyPostImage
            src={displayImages[0].url}
            alt="Main gallery image"
            className="object-cover"
          />
        </div>
      )}
      {/* Right side 2x2 grid */}
      <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-2">
        {displayImages.slice(1, 5).map((image, index) => (
          <div
            key={image.id}
            className="relative h-full cursor-pointer active:scale-[0.99] transition duration-75"
            onClick={() => setSelectedImage(image)}
          >
            <LazyPostImage
              src={image.url}
              alt={`Gallery image ${index + 2}`}
              className="object-cover"
              onLoadingChange={index === 0 ? setIsImageLoading : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (images.length === 0) return null;

  return (
    <div className="relative">
      {/* Show carousel on mobile, grid on desktop */}
      <div className="md:hidden">
        <MobileCarousel />
      </div>
      <div className="hidden md:block">
        <DesktopGrid />
      </div>

      {/* Show all photos button - visible only on desktop */}
      {hasMoreImages && (
        <Button
          variant="outline"
          className="absolute bottom-4 right-4 z-10 px-4 text-sm font-medium 
            hover:bg-yellow-400 rounded-xl border border-gray-900 active:scale-95 transition-all
            hidden md:flex"
          onClick={() => setShowAllPhotos(true)}
        >
          <Grip className='h-4 w-4 mr-2' /> Show all photos
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
    <DialogContent className="max-w-7xl border border-gray-900 p-0 w-full bg-black md:bg-white h-screen md:h-[90vh] md:p-4 md:rounded-xl">
      <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-all duration-200">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </DialogClose>

      {/* Image Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full md:rounded-lg overflow-hidden">
          <Image
            src={image.url}
            alt="Selected image"
            fill
            className="object-contain select-none"
            sizes="(max-width: 768px) 100vw, 90vw"
            priority
          />
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export function PostImagesSkeleton() {
  return (
    <div className="relative">
      {/* Mobile view - single image */}
      <div className="block md:hidden">
        <div className="w-full h-[300px] bg-muted animate-pulse rounded-lg" />
      </div>

      {/* Tablet and desktop view - grid layout */}
      <div className="hidden md:flex gap-1 h-[500px] rounded-lg overflow-hidden">
        {/* Large left image skeleton */}
        <div className="w-1/2 h-full">
          <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
        </div>
        {/* Right side 2x2 grid skeleton */}
        <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-1">
          {/* Skeleton boxes for the right side */}
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="relative h-full">
              <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Show all photos button skeleton */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="w-32 h-10 bg-muted animate-pulse rounded-md" />
      </div>
    </div>
  );
}
