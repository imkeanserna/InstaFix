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
    <div className='space-y-10'>
      <h3 className="text-2xl font-medium">Other Services Highlights from <span className='capitalize'>{name}</span></h3>
      <Carousel
        opts={{
          align: "start",
        }}
        className="relative w-full"
      >
        <CarouselContent className='py-2'>
          {highlightsPosts.map((post: PostWithUserInfo, index: number) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/5">
              <PostCard
                post={{ ...post, distance: null }}
                isFeatured={true}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}


