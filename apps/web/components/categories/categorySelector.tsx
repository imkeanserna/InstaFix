"use client";

import { useQuery } from '@tanstack/react-query';
import { CategoryResponse, getCategories } from "@/lib/categoriesUtils";
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, Layers } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@repo/ui/components/ui/toggle-group';

interface CategorySelectorProps {
  initialState: {
    category: string | null;
    subcategory: string | null;
  };
  onCategoryChange: (category: string | null, subcategory: string | null) => void;
}

export function CategorySelector({ initialState, onCategoryChange }: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialState.category);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(initialState.subcategory);

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
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 text-center"
        >
          <Layers className="w-12 h-12 mx-auto text-yellow-500 animate-pulse" />
          <p className="text-gray-600">Loading categories...</p>
        </motion.div>
      </div>
    );
  }

  const selectedCategoryData = categories?.find(
    category => category.id === selectedCategory
  );

  const variants = {
    enter: {
      x: 0,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.5
      }
    },
    center: {
      x: 0,
      opacity: 1,
      rotate: 0
    },
    exit: {
      x: -100,
      opacity: 0,
      rotate: -180,
      transition: {
        duration: 0.3
      }
    },
    selected: {
      rotate: -360,
      scale: 0.95,
      transition: {
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-8">
      <div className="flex">
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex"
        >
          <AnimatePresence mode="wait">
            <ToggleGroup
              type="single"
              value={selectedCategory || ""}
              onValueChange={handleCategorySelect}
              className="flex gap-4"
            >
              {categories
                ?.filter(cat => !selectedCategory || cat.id === selectedCategory)
                .map(({ id, name }) => (
                  <motion.div
                    key={id}
                    initial="center"
                    animate={selectedCategory === id ? 'selected' : 'enter'}
                    exit="exit"
                    variants={variants}
                    layout
                  >
                    <ToggleGroupItem
                      value={id}
                      className="group relative h-full w-full rounded-xl border-2 border-gray-200 
                        bg-gradient-to-br from-yellow-50 via-white to-gray-50 shadow-sm transition-all 
                        hover:shadow-lg hover:from-yellow-100 hover:via-yellow-50 hover:to-white 
                        data-[state=on]:border-yellow-500 data-[state=on]:shadow-md data-[state=on]:from-yellow-100 
                        data-[state=on]:via-yellow-50 data-[state=on]:to-white"
                    >
                      <div className="flex h-full p-4 sm:p-6">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-900 transition-colors group-hover:text-yellow-600">
                            {name}
                          </p>
                        </div>
                      </div>
                    </ToggleGroupItem>
                  </motion.div>
                ))}
            </ToggleGroup>
          </AnimatePresence>
        </motion.div>

        {selectedCategoryData?.subcategories && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 ml-4"
          >
            <AnimatePresence mode="wait">
              <ToggleGroup
                type="single"
                value={selectedSubcategory || ""}
                onValueChange={handleSubcategorySelect}
                className="flex"
              >
                {selectedCategoryData.subcategories.map((subcategory) => (
                  <motion.div
                    key={subcategory.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ToggleGroupItem
                      value={subcategory.id}
                      className="group w-full flex h-20 sm:h-24 items-center justify-between 
                          p-4 sm:p-6 rounded-xl border-2 border-gray-200 bg-gradient-to-br 
                          from-yellow-50 via-white to-gray-50 shadow-sm transition-all hover:shadow-lg 
                          hover:from-yellow-100 hover:via-yellow-50 hover:to-white data-[state=on]:border-yellow-500 
                          data-[state=on]:shadow-md data-[state=on]:from-yellow-100 
                          data-[state=on]:via-yellow-50 data-[state=on]:to-white"
                    >
                      <p className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-yellow-600">
                        {subcategory.name}
                      </p>
                      <ChevronRight className="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-yellow-500" />
                    </ToggleGroupItem>
                  </motion.div>
                ))}
              </ToggleGroup>
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
