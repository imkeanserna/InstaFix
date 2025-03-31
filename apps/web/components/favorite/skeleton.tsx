"use client";

import React from 'react';

// TextSkeleton component for text placeholders
const TextSkeleton = ({ width, height, className }: { width: string; height: string, className?: string }) => (
  <div className={`${width} ${height} bg-gray-200 rounded-md animate-pulse ${className}`}></div>
);

// Card skeleton component
const FavoriteCardSkeleton = () => (
  <div className="h-full group">
    <div className="border border-gray-300 rounded-2xl shadow-md">
      <div className="relative w-full aspect-square">
        <div className="relative aspect-square w-full bg-gray-200 rounded-xl animate-pulse"></div>
        {/* Heart button skeleton */}
        <div className="absolute top-2 right-2 p-2 rounded-xl">
          <div className="w-8 h-8 md:w-5 md:h-5 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Content Section */}
    <div className="flex flex-col justify-between mt-3">
      <TextSkeleton width="w-3/4" height="h-4" />
      <div className="flex gap-2 mt-1 items-center">
        <TextSkeleton width="w-1/2" height="h-4" />
        <TextSkeleton width="w-1/3" height="h-4" />
      </div>
    </div>
  </div>
);

export function FavoriteSkeleton() {
  return (
    <div className="px-6 md:px-24 py-8 pb-32 md:pb-48 md:py-16">
      <div className="hidden md:flex gap-6 items-center">
        {/* Title placeholder */}
        <TextSkeleton width="w-64" height="h-8" />
      </div>
      <div className="mt-0 md:mt-10 ps-0 md:ps-20">
        <div className="space-y-16">
          {[1, 2].map(group => (
            <div key={group} className="w-80">
              {/* Date placeholder */}
              <TextSkeleton width="w-32" height="h-6" className="mb-4" />
              <div className="space-y-8">
                <FavoriteCardSkeleton />
              </div>
            </div>
          ))}
        </div>
        <div className="h-10 w-full flex justify-center items-center py-6 mt-8">
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
}
