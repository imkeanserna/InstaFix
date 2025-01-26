"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Camera } from "lucide-react";
import React, { useState } from "react";
import { AnimatePresence, motion } from 'framer-motion'

interface MobileControlPanelProps {
  handleImageProcessing: (imageData: Blob | null, source: 'camera' | 'upload') => void;
  handleFiltersClick: () => void;
}

export const MobileControlPanel = React.memo(({ handleImageProcessing, handleFiltersClick }: MobileControlPanelProps) => {
  const [showFiltersHint, setShowFiltersHint] = useState(true);

  const handleFilterInteraction = () => {
    handleFiltersClick();
    setShowFiltersHint(false);

    const timer = setTimeout(() => {
      setShowFiltersHint(true);
      clearTimeout(timer);
    }, 3000);
    return () => clearTimeout(timer);
  };

  return (
    <div className="md:hidden relative">
      <AnimatePresence>
        {showFiltersHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 50 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y < -50 || velocity.y < -500) {
                handleFilterInteraction();
              }
            }}
            onClick={handleFilterInteraction}
            className="absolute bottom-20 left-0 right-0 flex justify-center z-20 px-4 cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <div className="bg-black/60 text-white px-4 py-2 rounded-full text-xs flex items-center gap-2">
              <span>Swipe/Click to Filters</span>
              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ↑
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-1 left-0 right-0 h-16 p-2 flex justify-center items-center">
        <Button
          onClick={() => { handleImageProcessing(null, 'camera') }}
          variant="outline"
          size="lg"
          className="z-10 w-full rounded-lg py-7 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-500 text-white hover:text-white border-none shadow-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          <span className="text-xl">Snap It</span>
        </Button>
      </div>
    </div>
  );
});

MobileControlPanel.displayName = "MobileControlPanel";
