"use client";

import Image from "next/image";
import { motion } from 'framer-motion';
import { ABOUT_YOUR_SERVICE } from "@/lib/bookUtils";

export default function Overview() {
  // For animation and it uses framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
  };

  return (
    <div className="min-h-screen w-full py-36 px-4 md:py-16 lg:py-44 lg:px-16 xl:px-32 2xl:px-80">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-8 lg:gap-16 xl:gap-24">
        <motion.h1
          className="text-3xl sm:text-5xl lg:text-6xl font-bold max-w-xl lg:w-[550px] text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {`It's easy to get started on Instafix`}
        </motion.h1>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 w-full"
        >
          {ABOUT_YOUR_SERVICE.map(({ title, description, imageSrc }, key) => {
            return (
              <motion.div
                key={key}
                variants={itemVariants}
                className={`flex sm:flex-row justify-between items-start gap-2 sm:gap-4 py-7 
                  ${key !== 2 && "border-b border-gray-300"}`}
                whileHover={{
                  x: 10,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.p
                  className="text-xl sm:text-2xl font-semibold"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: key * 0.3 + 0.2 }}
                >
                  {key + 1}
                </motion.p>

                <div className="space-y-2 sm:flex-1 max-w-[400px] sm:max-w-[500px]">
                  <motion.p
                    className="text-lg sm:text-2xl font-semibold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: key * 0.3 + 0.3 }}
                  >
                    {title}
                  </motion.p>
                  <motion.p
                    className="text-gray-500 text-xs sm:text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: key * 0.3 + 0.4 }}
                  >
                    {description}
                  </motion.p>
                </div>

                <motion.div
                  className="relative h-[100px] sm:h-[130px] w-[100px] sm:w-[130px] sm:ms-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: key * 0.3 + 0.5 }}
                >
                  <div className="absolute inset-0 h-full w-full z-10"></div>
                  <Image
                    src={imageSrc}
                    alt="Service Preview"
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
