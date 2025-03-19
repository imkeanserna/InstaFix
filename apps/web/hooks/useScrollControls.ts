import { useState, useEffect, RefObject } from 'react';

interface ScrollControls {
  showLeftButton: boolean;
  showRightButton: boolean;
  handleScroll: () => void;
  scroll: (direction: 'left' | 'right') => void;
}

export const useScrollControls = (
  scrollRef: RefObject<HTMLDivElement>,
  dependencies: any[] = []
): ScrollControls => {
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;

    const element = scrollRef.current;
    const hasHorizontalScroll = element.scrollWidth > element.clientWidth;
    const isAtStart = element.scrollLeft <= 0;
    const isAtEnd = Math.abs(
      element.scrollWidth - element.clientWidth - element.scrollLeft
    ) <= 1;

    setShowLeftButton(hasHorizontalScroll && !isAtStart);
    setShowRightButton(hasHorizontalScroll && !isAtEnd);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const newScrollPosition = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = scrollRef.current;

    if (container) {
      updateScrollButtons();
      container.addEventListener('scroll', updateScrollButtons);
    }

    const handleResize = () => {
      updateScrollButtons();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (container) {
        container.removeEventListener('scroll', updateScrollButtons);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [...dependencies]);

  return {
    showLeftButton,
    showRightButton,
    handleScroll: updateScrollButtons,
    scroll
  };
};

export function useScrollVisibility(threshold = 20, initialVisibility = true) {
  const [visible, setVisible] = useState(initialVisibility);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlVisibility = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && visible && currentScrollY > threshold) {
        // Scrolling down & element is currently visible
        setVisible(false);
      } else if (currentScrollY < lastScrollY && !visible) {
        // Scrolling up & element is currently hidden
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlVisibility);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', controlVisibility);
    };
  }, [lastScrollY, visible, threshold]);

  return { visible };
}
