"use client";

import { addReview } from "@/lib/reviewsUtils";
import { Button } from "@repo/ui/components/ui/button";
import { toast } from "@repo/ui/components/ui/sonner";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { RenderStars } from "../post/userSkillRating";
import { capitalizeFirstLetter } from "@/lib/notificationUtils";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DotTypingLoading } from "@repo/ui/components/ui/dot-typing-loading";

export interface ReviewContentProps {
  freelancerName: string;
  freelancerImage: string;
  titlePost: string;
  subCategory: string;
  serviceRating: number;
  noOfReviews: number;
  coverPhoto: string;
  canReview: boolean;
  postId: string;
  bookingId: string;
  onClose: () => void;
  containerClassName?: string;
}

export function ReviewContent({
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
  onClose,
  containerClassName = "",
}: ReviewContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleNextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex]);

  const handlePrevCard = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleRatingChange = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 640) {
      setComment(e.target.value);
    }
  };

  // Check if can proceed to next step
  const canProceedToComments = rating > 0;
  const canSubmitReview = comment.trim().length > 0;

  // Reset state on unmount or when explicitly reset
  const resetState = useCallback(() => {
    setCurrentIndex(0);
    setDirection(1);
    setRating(0);
    setComment('');
  }, []);

  // Prepare data for submission when user clicks "Send Review"
  const handleSubmitReview = async () => {
    setIsLoadingSubmit(true);
    try {
      const review = await addReview({
        postId,
        rating,
        comment,
        bookingId
      });

      if (review) {
        handleNextCard();
      }
    } catch (error) {
      toast.error('Failed to submit review, try again later');
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleBackButtonClick = () => {
    if (currentIndex > 0 && currentIndex < cards.length - 1) {
      handlePrevCard();
    } else {
      onClose();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  const cards = [
    {
      id: 1,
      content: (
        <div className="space-y-12 h-full w-full flex flex-col items-center justify-center">
          <div className="flex flex-col gap-4 px-8">
            <h2 className="text-center text-3xl">{`Add Review Feedback to ${capitalizeFirstLetter(freelancerName)}`}</h2>
            <p className="text-center text-xs px-8 text-gray-500">
              Your feedback helps freelancers improve and provide better service.
            </p>
          </div>
          <div>
            <div className="w-full flex justify-center items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                type="button"
                className="px-6 py-8 rounded-xl active:scale-95 flex flex-col"
              >
                <p className="font-semibold">{`No, I'm good`}</p>
                <span className="text-[10px] text-gray-500">{`I don't need any assistance.`}</span>
              </Button>
              <Button
                onClick={handleNextCard}
                disabled={!canReview}
                type="button"
                className="px-6 py-8 rounded-xl text-white flex flex-col active:scale-95 bg-yellow-400 hover:bg-yellow-500"
              >
                <p className="font-semibold">Yes, Please</p>
                <span className="text-[10px]">{`I'd love to provide feedback.`}</span>
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      content: (
        <div className="space-y-2 w-full h-full relative">
          <Image
            src={coverPhoto}
            alt={`cover photo of ${titlePost}`}
            width={150}
            height={150}
            className="h-36 w-full object-cover border border-gray-500"
          />
          <div className="flex justify-between border-b-2 border-gray-200 p-4">
            <div className="space-y-1">
              <p className="text-sm">{titlePost}</p>
              <p className="text-xs text-gray-500">{subCategory}</p>
            </div>
            <div className="space-y-1">
              <div className="flex drop-shadow-sm">
                {RenderStars(serviceRating, "w-3 h-3")}
              </div>
              <p className="text-xs text-gray-500">{noOfReviews} Reviewer</p>
            </div>
          </div>
          <div className="px-8 flex flex-col items-center space-y-4">
            <Image
              src={freelancerImage}
              alt={`profile picture of ${freelancerName}`}
              width={150}
              height={150}
              className="h-16 w-16 rounded-full object-cover shadow-md border border-gray-400"
            />
            <div className="flex flex-col">
              <h2 className="text-center text-2xl">{`How was your booking with ${capitalizeFirstLetter(freelancerName)}?`}</h2>
              <p className="text-center text-xs text-gray-500">
                Rate your experience with the freelancer
              </p>
            </div>
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  onClick={() => handleRatingChange(value)}
                  className="h-16 w-16 flex items-center justify-center p-0 border-none hover:bg-white"
                >
                  <Star
                    className={`h-8 w-8 ${value <= rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-400"
                      }`}
                  />
                </Button>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: rating > 0 ? 1 : 0,
                y: rating > 0 ? 0 : 0
              }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Button
                onClick={handleNextCard}
                variant={"outline"}
                type="button"
                disabled={!canProceedToComments}
                className={`py-4 px-8 absolute bottom-2 right-0 text-gray-900 bg-transparent border-none hover:bg-transparent active:scale-[0.98] transition-all duration-300 group ${!canProceedToComments ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2 opacity-0 transition-all duration-300 transform translate-x-0 group-hover:opacity-100 group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      content: (
        <div className="space-y-8 w-full flex flex-col justify-end h-full p-4">
          <div className="flex flex-col gap-4 px-8">
            <h2 className="text-center text-2xl">{`How was your booking with ${"Kean"}?`}</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-xs text-gray-500">Share your feedback</p>
              <p className="text-xs text-gray-500">{comment.length}/240</p>
            </div>
            <textarea
              placeholder="Tell us about your experience with Kean..."
              value={comment}
              onChange={handleCommentChange}
              className="w-full p-4 h-56 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <div className="w-full flex justify-between">
              <Button
                onClick={handleSubmitReview}
                type="button"
                disabled={!canSubmitReview || isLoadingSubmit}
                className={`py-8 px-8 w-full rounded-xl text-gray-900 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] ${!canSubmitReview ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {isLoadingSubmit ? <DotTypingLoading /> : "Send Review"}
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      content: (
        <div className="space-y-20 flex flex-col justify-end h-full p-4">
          <div className="flex flex-col px-8 items-center space-y-12">
            <div className="bg-yellow-100 h-24 w-24 rounded-full flex items-center justify-center">
              <motion.svg
                className="h-12 w-12 text-yellow-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    delay: 0.2
                  }}
                />
              </motion.svg>
            </div>
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.8
              }}
            >
              <h2 className="text-center text-3xl">Thanks for your feedback!</h2>
              <p className="text-center text-xs text-gray-500">
                Your feedback has been submitted successfully.
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <Button
              onClick={onClose}
              type="button"
              className="py-8 px-8 w-full rounded-xl text-gray-900 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98]"
            >
              Sure, I got it
            </Button>
          </motion.div>
        </div>
      ),
    },
  ];

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 600 : -600,
        opacity: 0,
        y: 0
      };
    },
    center: {
      x: 0,
      opacity: 1,
      y: 0
    },
    exit: (direction: number) => {
      return {
        x: direction < 0 ? 600 : -600,
        opacity: 0,
        y: 0
      };
    }
  };

  return (
    <div className={`relative w-full h-full ${containerClassName}`}>
      <Button
        variant="outline"
        onClick={handleBackButtonClick}
        className="absolute left-4 top-4 opacity-70 rounded-full p-3 border-none hover:bg-gray-100 transition-colors z-10 active:scale-95"
      >
        {currentIndex === 2 || currentIndex === 1 ? (
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        ) : (
          <X className="h-5 w-5 text-gray-500" />
        )}
      </Button>

      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: {
                type: "spring",
                stiffness: 180,
                damping: 25,
                mass: 1.2,
                duration: 0.02
              },
              opacity: { duration: 0.4 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            className="w-full h-full"
          >
            {cards[currentIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

