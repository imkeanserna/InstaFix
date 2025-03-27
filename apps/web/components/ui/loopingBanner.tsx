"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Diamond } from 'lucide-react';
import { LOOPING_BANNER_TEXTS } from '@/lib/landingPageUtils';

export const LoopingBanner = () => {
  const loopedTexts = [...LOOPING_BANNER_TEXTS, ...LOOPING_BANNER_TEXTS, ...LOOPING_BANNER_TEXTS, ...LOOPING_BANNER_TEXTS];

  return (
    <div className="absolute bottom-24 w-full overflow-hidden 
      bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 
      animate-gradient-x
      py-4 -rotate-3 z-10 shadow-xl">
      <motion.div
        className="flex items-center"
        initial={{ x: 0 }}
        animate={{
          x: [0, '-50%'],
          transition: {
            ease: 'linear',
            duration: 10,
            repeat: Infinity,
            repeatType: 'loop'
          }
        }}
      >
        {loopedTexts.map((text, index) => (
          <React.Fragment key={index}>
            <div className="flex-shrink-0 px-8 font-cocogoose font-light 
              text-white text-base tracking-wider whitespace-nowrap">
              {text}
            </div>
            <div className="flex-shrink-0 mx-4 opacity-70">
              <Diamond size={16} color="white" fill="white" />
            </div>
          </React.Fragment>
        ))}
        {loopedTexts.map((text, index) => (
          <React.Fragment key={`duplicate-${index}`}>
            <div className="flex-shrink-0 px-8 font-cocogoose font-light 
              text-white text-lg tracking-wider whitespace-nowrap 
              drop-shadow-md">
              {text}
            </div>
            <div className="flex-shrink-0 mx-4 opacity-70">
              <Diamond size={16} color="white" fill="white" />
            </div>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
