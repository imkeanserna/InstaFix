"use client";

import { SCROLLING_TEXT } from '@/lib/landingPageUtils';
import React from 'react';

export const ScrollingText = () => {
  return (
    <div className="overflow-hidden w-full relative py-0 md:py-4 space-y-0 md:space-y-4 z-20">
      {/* Left Scrolling Text */}
      <div className="flex animate-scroll-left whitespace-nowrap will-change-transform">
        {[...Array(6)].map((_, index) => (
          <span
            key={`left-${index}`}
            className="inline-block font-display text-center leading-[3rem] text-[2.8rem] 
              font-bold tracking-[-0.02em] text-white dark:text-white md:text-[80px] md:leading-[5rem] px-1 md:px-4"
          >
            {SCROLLING_TEXT.text}
          </span>
        ))}
      </div>
      {/* Right Scrolling Text */}
      <div className="flex animate-scroll-right whitespace-nowrap will-change-transform">
        {[...Array(6)].map((_, index) => (
          <span key={`right-${index}`} className="inline-block font-display text-center leading-[3rem] 
              text-[2.8rem] font-bold tracking-[-0.02em] text-white dark:text-white md:text-[80px] md:leading-[5rem] px-1 md:px-4"
          >
            {SCROLLING_TEXT.text}
          </span>
        ))}
      </div>
    </div>
  );
};
