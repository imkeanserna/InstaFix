"use client";

import React, { useEffect, useRef, useState } from "react";
import { Calendar1 } from "lucide-react";
import { AnimatePresence, motion, PanInfo, useAnimation } from 'framer-motion'
import { Button } from "@repo/ui/components/ui/button";
import { BookingForm } from "../posts/post/bookingForm";
import { User } from "next-auth";
import { PricingType } from "@prisma/client/edge";

export const BookingDrawerWrapper = ({
  className,
  postId,
  user,
  rate,
  username,
  freelancerId,
  pricingType,
  credits
}: {
  className?: string;
  postId: string,
  user: User | null
  rate: number
  username: string
  freelancerId: string
  pricingType: PricingType
  credits: number
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const isUnavailable = credits === 0;

  return (
    <>
      <Button variant="outline"
        className="w-full px-8 text-sm py-8 rounded-xl font-medium hover:bg-yellow-500 bg-yellow-400 border border-gray-900 active:scale-95 transition-all"
        onClick={isUnavailable ? undefined : () => setIsVisible(!isVisible)}
        disabled={isUnavailable}
      >
        <Calendar1 className="h-4 w-4 mr-2" />
        Book now
      </Button>
      <AnimatePresence>
        {isVisible && (
          <Drawer
            className={className}
            onClose={() => setIsVisible(false)}
            postId={postId}
            rate={rate}
            freelancerId={freelancerId}
            user={user}
            username={username}
            pricingType={pricingType}
            credits={credits}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export const Drawer = React.memo(({
  className,
  onClose,
  postId,
  user,
  rate,
  username,
  freelancerId,
  pricingType,
  credits
}:
  {
    className?: string;
    onClose: () => void;
    postId: string,
    user: User | null
    rate: number
    username: string
    freelancerId: string
    pricingType: PricingType
    credits: number
  }
) => {
  // Drawer state
  const [isOpen, setIsOpen] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Drawer height
  const drawerHeight = window.innerHeight * 0.48;
  const minHeight = 100;

  const springTransition = {
    type: "spring",
    damping: 30,
    stiffness: 300,
    mass: 0.8
  };

  const drawerVariants = {
    hidden: {
      y: "100%",
      height: drawerHeight,
      transition: springTransition
    },
    visible: {
      y: 0,
      height: drawerHeight,
      transition: springTransition
    },
    exit: {
      y: "100%",
      transition: { ...springTransition, duration: 0.3 }
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.y;
    const currentOffset = info.offset.y;


    if (velocity > 500 || currentOffset > 200) {
      // Close the drawer completely if swiped down fast or far enough
      onClose();
    } else if (velocity < -500 || currentOffset < -200) {
      // Open fully if swiped up fast or far enough
      controls.start({ height: minHeight });
      setIsOpen(true);
    } else {
      // Snap to nearest position
      const currentHeight = containerRef.current?.getBoundingClientRect().height || 0;
      if (currentHeight < drawerHeight) {
        controls.start({ height: minHeight });
        setIsOpen(false);
      } else {
        controls.start({ height: minHeight });
        setIsOpen(true);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-40"
      />

      {/* Drawer */}
      <motion.div
        ref={containerRef}
        variants={drawerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        drag={"y"}
        dragConstraints={{ top: 0, bottom: window.innerHeight - minHeight }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="fixed border-t-2 border-gray-200 bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
      >
        {/* Drawer Handle */}
        <div
          className="pt-4 pb-2 cursor-pointer"
          onClick={onClose}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto transition-colors hover:bg-gray-400" />
        </div>
        {/* Content */}
        <motion.div
          className="overflow-y-auto h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div>
            <BookingForm
              postId={postId}
              user={user}
              rate={rate}
              username={username}
              freelancerId={freelancerId}
              pricingType={pricingType}
              credits={credits}
            />
          </div>
        </motion.div>
      </motion.div>
    </>
  );
});

Drawer.displayName = "Filters";
