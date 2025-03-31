"use client";

import { useQuery } from '@tanstack/react-query';
import { CategoryResponse, getCategories } from "@/lib/categoriesUtils";
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@repo/ui/components/ui/toggle-group';
import Image from 'next/image';
import { Button } from '@repo/ui/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollControls } from '@/hooks/useScrollControls';

interface CategorySelectorProps {
  initialState: {
    category: string | null;
    subcategory: string | null;
  };
  onCategoryChange: (category: string | null, subcategory: string | null) => void;
}

const variants = {
  initial: { scale: 1, opacity: 0 },
  animate: (isSelected: boolean) => ({
    scale: isSelected ? 1.1 : 1,
    opacity: 1,
    transition: { duration: 0.3 }
  }),
  hover: {
    scale: 1.1,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30
    }
  }
};

export function CategorySelector({ initialState, onCategoryChange }: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialState.category);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(initialState.subcategory);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const subcategoryScrollRef = useRef<HTMLDivElement>(null);

  const {
    showLeftButton: showLeftCategoryButton,
    showRightButton: showRightCategoryButton,
    scroll: scrollCategory
  } = useScrollControls(categoryScrollRef, [selectedCategory]);

  const {
    showLeftButton: showLeftSubcategoryButton,
    showRightButton: showRightSubcategoryButton,
    scroll: scrollSubcategory
  } = useScrollControls(subcategoryScrollRef, [selectedCategory]);

  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useQuery<CategoryResponse[], Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const handleCategorySelect = (value: string) => {
    const newValue = value === selectedCategory ? null : value;
    setSelectedCategory(newValue);
    setSelectedSubcategory(null);
    onCategoryChange(newValue, null);
  };

  const handleSubcategorySelect = (value: string) => {
    const newValue = value === selectedSubcategory ? null : value;
    setSelectedSubcategory(newValue);
    onCategoryChange(selectedCategory, newValue);
  };

  if (isCategoriesLoading || categoriesError) {
    return (
      <div className="shadow-lg rounded-2xl p-4 sm:p-8">
        <div className="flex items-center justify-center">
          <div className="space-y-4 w-full">
            <CategorySkeleton />
            {selectedCategory && <SubcategorySkeleton />}
          </div>
        </div>
      </div>
    );
  }

  const selectedCategoryData = categories?.find(
    category => category.id === selectedCategory
  );

  const subcategoryVariants = {
    hidden: {
      opacity: 0,
      x: 200,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      x: -200,
      scale: 0.9,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className="rounded-2xl">
      <div className="flex gap-2">
        <div className={`relative ${selectedCategory ? 'w-auto' : 'overflow-x-auto'}`}>
          {!selectedCategory && showLeftCategoryButton && (
            <Button
              variant="default"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 border rounded-full
                  border-gray-200 bg-white hover:bg-gray-100 shadow-md"
              onClick={() => scrollCategory('left')}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </Button>
          )}
          <motion.div
            ref={categoryScrollRef}
            initial="hidden"
            animate="visible"
            className="flex overflow-x-auto py-4 sm:py-8 scrollbar-hide"
          >
            <div className="min-w-full px-2 sm:px-4">
              <AnimatePresence mode="wait">
                <ToggleGroup
                  type="single"
                  value={selectedCategory || ""}
                  onValueChange={handleCategorySelect}
                  className="flex gap-3 sm:gap-6 min-w-max"
                >
                  {categories
                    ?.filter(cat => !selectedCategory || cat.id === selectedCategory)
                    .map(({ id, name, imageSrc }) => (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                          opacity: !selectedCategory || selectedCategory === id ? 1 : 0.5,
                          scale: 1
                        }}
                        variants={variants}
                        layout
                      >
                        <ToggleGroupItem
                          value={id}
                          className="group relative h-full w-full rounded-xl bg-transparent hover:bg-transparent 
                           data-[state=on]:bg-transparent"
                        >
                          <div className="flex h-full items-center justify-center">
                            <div className={`
                              flex flex-col items-center text-center 
                              transition-all group-hover:opacity-100 hover:text-yellow-600
                              ${selectedCategory === id ? 'text-yellow-600 opacity-100' : 'text-gray-900 opacity-70'}
                            `}>
                              <LazyImage
                                src={imageSrc || ""}
                                alt={name}
                                name={name}
                                isSelected={selectedCategory === id}
                                className="h-6 w-6 sm:h-8 sm:w-8"
                                width={32}
                                height={32}
                              />
                            </div>
                          </div>
                        </ToggleGroupItem>
                      </motion.div>
                    ))}
                </ToggleGroup>
              </AnimatePresence>
            </div>
          </motion.div>
          {!selectedCategory && showRightCategoryButton && (
            <Button
              variant="default"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 border rounded-full
                  border-gray-200 bg-white hover:bg-gray-100 shadow-md"
              onClick={() => scrollCategory('right')}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </Button>
          )}
        </div>

        {
          selectedCategoryData?.subcategories && (
            <div className={`relative w-full overflow-hidden ${selectedCategory && "border-l-0 sm:border-l border-gray-200 rounded-2xl"}`}>
              {showLeftSubcategoryButton && (
                <Button
                  variant="default"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 border rounded-full
                  border-gray-200 bg-white hover:bg-gray-100 shadow-md"
                  onClick={() => scrollSubcategory('left')}
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                </Button>
              )}
              <motion.div
                ref={subcategoryScrollRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full overflow-x-auto py-4 sm:py-8 scrollbar-hide"
              >
                <div className="min-w-full px-2 sm:px-4">
                  <AnimatePresence mode="wait">
                    <ToggleGroup
                      type="single"
                      value={selectedSubcategory || ""}
                      onValueChange={handleSubcategorySelect}
                      className="flex gap-3 sm:gap-6 min-w-max justify-start items-start"
                    >
                      {selectedCategoryData.subcategories.map((subcategory, index) => (
                        <motion.div
                          key={subcategory.id}
                          variants={subcategoryVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={{
                            delay: index * 0.1
                          }}
                        >
                          <ToggleGroupItem
                            value={subcategory.id}
                            className="group relative h-full w-full rounded-xl bg-transparent hover:bg-transparent 
                                     data-[state=on]:bg-transparent"
                          >
                            <div className="flex h-full items-center justify-center">
                              <div className={`
                              flex flex-col items-center text-center 
                              transition-all group-hover:opacity-100 hover:text-yellow-600
                              ${selectedSubcategory === subcategory.id ? 'text-yellow-600 opacity-100' : 'text-gray-900 opacity-70'}
                            `}>
                                <LazyImage
                                  src={subcategory.imageSrc || ""}
                                  alt={subcategory.name}
                                  name={subcategory.name}
                                  isSelected={selectedSubcategory === subcategory.id}
                                  className="h-6 w-6 sm:h-8 sm:w-8"
                                  width={32}
                                  height={32}
                                />
                              </div>
                            </div>
                          </ToggleGroupItem>
                        </motion.div>
                      ))}
                    </ToggleGroup>
                  </AnimatePresence>
                </div>
              </motion.div>
              {showRightSubcategoryButton && (
                <Button
                  variant="default"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 border rounded-full
                  border-gray-200 bg-white hover:bg-gray-100 shadow-md"
                  onClick={() => scrollSubcategory('right')}
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                </Button>
              )}
            </div>
          )
        }
      </div >
    </div >
  )
}

const LazyImage = ({
  src,
  alt,
  name,
  width = 64,
  height = 64,
  className = "h-8 w-8",
  isSelected = false
}: {
  src: string;
  alt: string;
  name: string;
  width?: number;
  height?: number;
  className?: string;
  isSelected?: boolean
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      className="relative flex flex-col items-center min-w-[3rem] sm:min-w-[4rem] max-w-[8rem] sm:max-w-[12rem] group"
      variants={variants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      custom={isSelected}
    >
      <div className="relative mb-1 sm:mb-2">
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full flex items-center justify-center">
            <div className="h-6 w-6 sm:h-10 sm:w-10 bg-gray-300 rounded-md" />
          </div>
        )}
        <div className="relative">
          <div className="absolute inset-0 z-10 bg-transparent" />
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity`}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>
      {!isLoaded ? (
        <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-300 rounded-md" />
      ) : (
        <div className="relative">
          <p className="text-[10px] sm:text-xs font-medium transition-colors group-hover:text-yellow-600 data-[state=on]:text-yellow-600 whitespace-nowrap">
            {name}
          </p>
          <span
            className={`absolute top-full left-1/2 h-0.5 bg-yellow-400 transition-all duration-300 transform mt-2 sm:mt-3 ${isSelected
              ? '-translate-x-1/2 w-full'
              : 'w-0 -translate-x-1/2 group-hover:w-full'
              }`}
          />
        </div>
      )}
    </motion.div>
  );
};

const CategorySkeleton = () => (
  <div className="overflow-x-auto px-2 sm:px-4">
    <div className="flex items-center gap-3 sm:gap-6 min-w-max animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <div key={item} className="flex flex-col items-center gap-1 sm:gap-2 min-w-[3rem] sm:min-w-[4rem]">
          <div className="h-6 w-6 sm:h-10 sm:w-10 bg-gray-300 rounded-full"></div>
          <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-300 rounded-md"></div>
        </div>
      ))}
    </div>
  </div>
);

const SubcategorySkeleton = () => (
  <div className="overflow-x-auto px-2 sm:px-4">
    <div className="flex gap-3 sm:gap-6 min-w-max animate-pulse">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex flex-col items-center gap-1 sm:gap-2 min-w-[3rem] sm:min-w-[4rem]">
          <div className="h-6 w-6 sm:h-10 sm:w-10 bg-gray-300 rounded-full"></div>
          <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-300 rounded-md"></div>
        </div>
      ))}
    </div>
  </div>
);
