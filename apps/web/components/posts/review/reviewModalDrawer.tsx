"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@repo/ui/components/ui/dialog';
import { motion, AnimatePresence, useAnimation, PanInfo } from 'framer-motion';
import { ReviewContent, ReviewContentProps } from './reviewContent';

export function ReviewModal({
  freelancerName,
  freelancerImage,
  titlePost,
  subCategory,
  serviceRating,
  noOfReviews,
  coverPhoto,
  canReview,
  postId,
  bookingId,
  isOpen,
  onClose
}: ReviewContentProps & { isOpen: boolean }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] h-[500px] p-0 !rounded-3xl overflow-hidden flex items-center justify-center">
        <ReviewContent
          freelancerName={freelancerName}
          freelancerImage={freelancerImage}
          titlePost={titlePost}
          subCategory={subCategory}
          serviceRating={serviceRating}
          noOfReviews={noOfReviews}
          coverPhoto={coverPhoto}
          canReview={canReview}
          postId={postId}
          bookingId={bookingId}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export const ReviewDrawerWrapper = ({
  freelancerName,
  freelancerImage,
  titlePost,
  subCategory,
  serviceRating,
  noOfReviews,
  coverPhoto,
  canReview,
  postId,
  bookingId,
  onClose
}: ReviewContentProps) => {
  const [isVisible, setIsVisible] = useState(canReview);

  return (
    <AnimatePresence>
      {isVisible && (
        <ReviewDrawer
          onClose={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          postId={postId}
          freelancerName={freelancerName}
          freelancerImage={freelancerImage}
          titlePost={titlePost}
          subCategory={subCategory}
          serviceRating={serviceRating}
          noOfReviews={noOfReviews}
          coverPhoto={coverPhoto}
          bookingId={bookingId}
          canReview={canReview}
        />
      )}
    </AnimatePresence>
  );
};

export const ReviewDrawer = React.memo(({
  onClose,
  postId,
  freelancerName,
  freelancerImage,
  titlePost,
  subCategory,
  serviceRating,
  noOfReviews,
  coverPhoto,
  bookingId,
  canReview
}: ReviewContentProps) => {
  // Drawer state
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Drawer height
  const drawerHeight = window.innerHeight * .58;
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
    } else {
      // Snap back to open position
      controls.start("visible");
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
        className="fixed border-t-2 overflow-hidden border-gray-200 bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
      >
        {/* Content */}
        <motion.div
          className="overflow-y-auto h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <ReviewContent
            freelancerName={freelancerName}
            freelancerImage={freelancerImage}
            titlePost={titlePost}
            subCategory={subCategory}
            serviceRating={serviceRating}
            noOfReviews={noOfReviews}
            coverPhoto={coverPhoto}
            canReview={canReview}
            postId={postId}
            bookingId={bookingId}
            onClose={onClose}
            containerClassName="pt-2"
          />
        </motion.div>
      </motion.div>
    </>
  );
});

ReviewDrawer.displayName = "ReviewDrawer";
