"use client";

import { useEffect, useState } from "react";

export const useTextRotator = (texts: string[], interval = 2000) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [texts, interval]);

  return texts[index];
};

export const useTestimonialCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showTestimonials, setShowTestimonials] = useState(false);
  const [showOverallTestimonial, setShowOverallTestimonial] = useState(false);
  const [isReturningToSecond, setIsReturningToSecond] = useState(false);
  const [clickTrigger, setClickTrigger] = useState(0);

  useEffect(() => {
    // -1 represents overall testimonial, -2 represents hiding phase
    const sequence = [0, 1, 2, 1, -1, -2];
    let currentStep = 0;

    const interval = setInterval(() => {
      const nextIndex = sequence[currentStep];

      if (nextIndex === -1) {
        setActiveIndex(-1);
        setShowOverallTestimonial(true);
      } else if (nextIndex === -2) {
        setShowOverallTestimonial(false);
        // Wait for 1 seconds and then hide testimonials
        setTimeout(() => {
          setShowTestimonials(false);
        }, 1000);
      } else {
        setShowOverallTestimonial(false);
        setShowTestimonials(true);
        setActiveIndex(nextIndex);
        if (nextIndex === 1 && currentStep !== 0) {
          // Trigger click animation
          setClickTrigger(prev => prev + 1);
          setIsReturningToSecond(true);
        } else {
          setIsReturningToSecond(false);
        }
      }
      // Move to next step, loop back to start if needed
      currentStep = (currentStep + 1) % sequence.length;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { activeIndex, showTestimonials, showOverallTestimonial, isReturningToSecond, clickTrigger };
};
