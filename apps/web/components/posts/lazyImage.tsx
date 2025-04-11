"use client";

import Image from "next/image";
import { useState } from "react";

export const LazyPostImage = ({ src,
  sizes = "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
  alt, className = "", onLoadingChange, priority }: {
    src: string
    alt: string
    className?: string
    sizes?: string
    priority?: boolean
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
        quality={100}
        fill
        priority={priority}
        sizes={sizes}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleLoad}
      />
      <div
        className="absolute inset-0"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};

export const LazyAvatarImage = ({ src, alt, className = "", onLoadingChange }: {
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
        width={96}
        height={96}
        quality={100}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 object-cover w-full h-full`}
        onLoad={handleLoad}
        style={{ objectFit: 'cover' }}
      />
      <div
        className="absolute inset-0"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};
