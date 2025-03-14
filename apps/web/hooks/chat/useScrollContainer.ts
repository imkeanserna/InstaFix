"use client";

import { useRef, useCallback, useEffect } from 'react';

interface UseScrollContainerProps {
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  loadMore?: () => Promise<void>;
  isNewMessage?: boolean;
  resetNewMessageFlag?: () => void;
  items: any[];
  threshold?: number;
  rootMargin?: string;
  smoothScroll?: boolean;
  initialScrollDelay?: number;
}

export function useScrollContainer({
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  loadMore = async () => { },
  isNewMessage = false,
  resetNewMessageFlag = () => { },
  items = [],
  threshold = 0.5,
  rootMargin = '50px 0px',
  smoothScroll = true,
  initialScrollDelay = 100
}: UseScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadTriggerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smoothScroll ? 'smooth' : 'auto'
      });
    }
  }, [smoothScroll]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && containerRef.current && items.length > 0) {
      const timeoutId = setTimeout(() => {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'auto'
        });
      }, initialScrollDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, initialScrollDelay]);

  // Scroll to bottom when new message is added
  useEffect(() => {
    if (items.length > 0 && isNewMessage) {
      scrollToBottom();
      if (resetNewMessageFlag) {
        resetNewMessageFlag();
      }
    }
  }, [scrollToBottom, isNewMessage, items.length, resetNewMessageFlag]);

  // Function to load more with scroll position maintenance
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;

      const currentHeight = containerRef.current?.scrollHeight || 0;
      await loadMore();

      requestAnimationFrame(() => {
        if (containerRef.current) {
          const newHeight = containerRef.current.scrollHeight;
          containerRef.current.scrollTop = newHeight - currentHeight;
        }
      });
    } finally {
      isLoadingRef.current = false;
    }
  }, [hasMore, isLoadingMore, loadMore]);

  // Setup intersection observer for infinite loading
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let currentTriggerRef = loadTriggerRef.current;

    const timeoutId = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoadingRef.current) {
            console.log("Loading more content...");
            handleLoadMore();
          }
        },
        {
          threshold,
          rootMargin
        }
      );

      if (currentTriggerRef) {
        observer.observe(currentTriggerRef);
      }
    }, 500);

    // Cleanup observer and timeout
    return () => {
      clearTimeout(timeoutId);
      if (observer && currentTriggerRef) {
        observer.unobserve(currentTriggerRef);
        observer.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, handleLoadMore, threshold, rootMargin]);

  return {
    containerRef,
    loadTriggerRef,
    scrollToBottom,
  };
}
