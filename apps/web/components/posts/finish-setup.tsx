"use client";

import React from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { motion, Variants } from "framer-motion";
import { FINISH_POST_IMAGE } from '@/lib/bookUtils';

export function FinishSetup() {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const bounceVariants: Variants = {
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="h-full w-full py-24 sm:py-16 md:py-48">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          {/* Left Content Section */}
          <motion.div
            className="flex-1 w-full space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="space-y-6">
              <motion.div
                variants={fadeUpVariants}
                className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm"
              >
                <motion.span
                  className="text-sm font-medium text-gray-600"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  Step 2 of 3
                </motion.span>
                <motion.div
                  initial={{ opacity: 0, rotate: -30 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <Sparkles className="w-4 h-4 text-blue-500" />
                </motion.div>
              </motion.div>

              <div className="space-y-4">
                <motion.h1
                  variants={fadeUpVariants}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
                >
                  Finish up and publish
                </motion.h1>
                <motion.p
                  variants={fadeUpVariants}
                  className="text-sm text-gray-700 leading-relaxed"
                >
                  {`Once you've published your listing, it's time to get your clients. We're excited to show you how easy it is to get started with our platform.`}
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Right Image Section */}
          <motion.div
            className="flex-1 w-full relative"
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-yellow-500 to-yellow-500 opacity-20 blur-2xl rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.2, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
            <motion.div
              className="relative"
              variants={bounceVariants}
              animate="animate"
            >
              <motion.div
                className="relative w-full h-[250px] sm:h-[450px]"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                <Image
                  src={FINISH_POST_IMAGE}
                  alt="Service Preview"
                  fill
                  className="object-cover rounded-xl h-full w-full"
                  priority
                />
              </motion.div>
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
