"use client";

import { memo, useCallback, useMemo, useState } from 'react';
import { Media } from '@prisma/client/edge';
import { Dialog, DialogClose, DialogContent } from '@repo/ui/components/ui/dialog';
import { Grip, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@repo/ui/components/ui/button';
import { LazyPostImage } from '../lazyImage';
import { Carousel, CarouselContent, CarouselCounter, CarouselItem } from '@repo/ui/components/ui/carousel';

export const PostImages = memo(function PostImages({ media }: { media: Media[] }) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const images = useMemo(() => media.filter(m => m.type === 'IMAGE'), [media]);
  const hasMoreImages = images.length > 5;
  const displayImages = useMemo(() =>
    hasMoreImages ? images.slice(0, 5) : images,
    [images, hasMoreImages]
  );

  const handleSetSelectedImage = useCallback((image: Media) => {
    setSelectedImage(image);
  }, []);

  const handleSetIsImageLoading = useCallback((value: boolean) => {
    setIsImageLoading(value);
  }, []);

  const handleShowAllPhotos = useCallback(() => {
    setShowAllPhotos(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  if (images.length === 0) return null;

  return (
    <div className="relative">
      {/* Show carousel on mobile, grid on desktop */}
      <div className="md:hidden">
        <MobileCarousel
          images={images}
          setSelectedImage={handleSetSelectedImage}
          setIsImageLoading={handleSetIsImageLoading}
        />
      </div>
      <div className="hidden md:block">
        <DesktopGrid
          displayImages={displayImages}
          setSelectedImage={handleSetSelectedImage}
          setIsImageLoading={handleSetIsImageLoading}
        />
      </div>

      {/* Show all photos button - visible only on desktop */}
      {hasMoreImages && (
        <Button
          variant="outline"
          className="absolute bottom-4 right-4 z-10 px-4 text-sm font-medium 
            hover:bg-yellow-400 rounded-xl border border-gray-900 active:scale-95 transition-all
            hidden md:flex"
          onClick={handleShowAllPhotos}
        >
          <Grip className='h-4 w-4 mr-2' /> Show all photos
        </Button>
      )}

      {/* Full-screen gallery modal */}
      <ImageGalleryModal
        showAllPhotos={showAllPhotos}
        setShowAllPhotos={setShowAllPhotos}
        images={images}
        setSelectedImage={handleSetSelectedImage}
      />
      {selectedImage && (
        <SingleImageModal
          image={selectedImage}
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
});

interface ImageGalleryModalProps {
  showAllPhotos: boolean;
  setShowAllPhotos: (show: boolean) => void;
  images: Media[];
  setSelectedImage: (image: Media) => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = memo(({
  showAllPhotos,
  setShowAllPhotos,
  images,
  setSelectedImage
}) => (
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
));

ImageGalleryModal.displayName = "ImageGalleryModal";

interface MobileCarouselProps {
  images: Media[];
  setSelectedImage: (image: Media) => void;
  setIsImageLoading: (loading: boolean) => void;
}

const MobileCarousel: React.FC<MobileCarouselProps> = memo(({
  images,
  setSelectedImage,
  setIsImageLoading
}) => (
  <div className="relative w-full h-[400px]">
    <Carousel className="w-full h-full overflow-hidden">
      <CarouselContent className="-ml-0">
        {images.map((image, index) => (
          <CarouselItem key={image.id} className="pl-0">
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
));

MobileCarousel.displayName = "MobileCarousel";

interface DesktopGridProps {
  displayImages: Media[];
  setSelectedImage: (image: Media) => void;
  setIsImageLoading: (loading: boolean) => void;
}

const DesktopGrid: React.FC<DesktopGridProps> = memo(({
  displayImages,
  setSelectedImage,
  setIsImageLoading
}) => {
  // Different layouts based on image count
  if (displayImages.length === 0) {
    return <div className="h-[500px] rounded-2xl bg-gray-100 flex items-center justify-center">No images available</div>;
  }

  if (displayImages.length === 1) {
    // For single image, show it full width
    return (
      <div className="h-[500px] rounded-2xl overflow-hidden">
        <div
          className="w-full h-full relative cursor-pointer active:scale-[0.99] transition duration-75"
          onClick={() => setSelectedImage(displayImages[0])}
        >
          <LazyPostImage
            src={displayImages[0].url}
            alt="Gallery image"
            className="object-cover"
            onLoadingChange={setIsImageLoading}
          />
        </div>
      </div>
    );
  }

  if (displayImages.length === 2) {
    // For two images, split screen 50/50
    return (
      <div className="flex gap-2 h-[500px] rounded-2xl overflow-hidden">
        {displayImages.map((image, index) => (
          <div
            key={image.id}
            className="w-1/2 h-full relative cursor-pointer active:scale-[0.99] transition duration-75"
            onClick={() => setSelectedImage(image)}
          >
            <LazyPostImage
              src={image.url}
              alt={`Gallery image ${index + 1}`}
              className="object-cover"
              onLoadingChange={index === 0 ? setIsImageLoading : undefined}
            />
          </div>
        ))}
      </div>
    );
  }

  if (displayImages.length === 3) {
    // For three images, show first one large, other two in a column
    return (
      <div className="flex gap-2 h-[500px] rounded-2xl overflow-hidden">
        <div
          className="w-2/3 h-full relative cursor-pointer active:scale-[0.99] transition duration-75"
          onClick={() => setSelectedImage(displayImages[0])}
        >
          <LazyPostImage
            src={displayImages[0].url}
            alt="Main gallery image"
            className="object-cover"
            onLoadingChange={setIsImageLoading}
          />
        </div>
        <div className="w-1/3 flex flex-col gap-2">
          {displayImages.slice(1, 3).map((image, index) => (
            <div
              key={image.id}
              className="h-1/2 relative cursor-pointer active:scale-[0.99] transition duration-75"
              onClick={() => setSelectedImage(image)}
            >
              <LazyPostImage
                src={image.url}
                alt={`Gallery image ${index + 2}`}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displayImages.length === 4) {
    // For four images, show first one large, other three in a column
    return (
      <div className="flex gap-2 h-[500px] rounded-2xl overflow-hidden">
        <div
          className="w-1/2 h-full relative cursor-pointer active:scale-[0.99] transition duration-75"
          onClick={() => setSelectedImage(displayImages[0])}
        >
          <LazyPostImage
            src={displayImages[0].url}
            alt="Main gallery image"
            className="object-cover"
            onLoadingChange={setIsImageLoading}
          />
        </div>
        <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-2">
          {displayImages.slice(1, 4).map((image, index) => (
            <div
              key={image.id}
              className={`relative cursor-pointer active:scale-[0.99] transition duration-75 ${index === 0 ? "col-span-2" : ""
                }`}
              onClick={() => setSelectedImage(image)}
            >
              <LazyPostImage
                src={image.url}
                alt={`Gallery image ${index + 2}`}
                className="object-cover h-full"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default layout for 5 or more images (your original layout)
  return (
    <div className="flex gap-2 h-[500px] rounded-2xl overflow-hidden">
      <div
        className="w-1/2 h-full relative cursor-pointer active:scale-[0.99] transition duration-75"
        onClick={() => setSelectedImage(displayImages[0])}
      >
        <LazyPostImage
          src={displayImages[0].url}
          alt="Main gallery image"
          className="object-cover"
          onLoadingChange={setIsImageLoading}
        />
      </div>
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
            />
          </div>
        ))}
      </div>
    </div>
  );
});

DesktopGrid.displayName = "DesktopGrid";

export const SingleImageModal = ({
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
