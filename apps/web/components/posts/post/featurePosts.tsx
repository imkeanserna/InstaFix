"use client";

import { PostWithUserInfo } from '@repo/types';
import { PostCard } from '../find/postsCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/components/ui/carousel"

export function FeaturePosts({ highlightsPosts, name }: { highlightsPosts: PostWithUserInfo[], name: string }) {
  return (
    <div className='space-y-8 sm:space-y-10'>
      <h3 className="text-xl sm:text-2xl font-medium">
        Other Services Highlights from <span className='capitalize'>{name}</span>
      </h3>
      <Carousel
        opts={{
          align: "start",
        }}
        className="relative w-full"
      >
        <CarouselContent className='py-2'>
          {highlightsPosts.map((post: PostWithUserInfo, index: number) => (
            <CarouselItem
              key={index}
              className="basis-4/6 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <PostCard
                post={{ ...post, distance: null }}
                isFeatured={true}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
}


