"use client";

import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { getCategories } from "@/lib/categoriesUtils";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from "react";
import {
  PawPrint,
  Palette,
  Home,
  Wrench,
  Scissors,
  Trophy,
  Cpu,
  Car,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[] | null;
}

export default function Categories() {
  const { formData, updateFormData } = useFormData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSubcategory] = useState<string | null>(null);
  const { setStepValidity } = useRouteValidation('categories');
  const { data: categories, isLoading } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  useEffect(() => {
    console.log(categories);
    setStepValidity(formData);
  }, [formData, setStepValidity, categories]);

  const handleCategorySelect = (value: string) => {
    const newValue = value === selectedCategory ? null : value;
    setSelectedCategory(newValue);
  };

  const handleSubcategorySelect = (value: string) => {
    const newValue = value === selectedSubcategory ? null : value;
    setSubcategory(newValue);
    updateFormData({ tags: { subcategoryId: newValue! } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 text-center">
          <Layers className="w-12 h-12 mx-auto text-yellow-500 animate-pulse" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  const selectedCategoryData = categories?.find(
    (category: Category) => category.id === selectedCategory
  );

  return (
    <Card className="p-8 bg-white shadow-lg rounded-2xl">
      {selectedCategory && (
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedCategory(null);
              setSubcategory(null);
              updateFormData({ tags: { subcategoryId: "" } });
            }}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to all categories
          </Button>
        </div>
      )}

      <div className="space-y-8">
        {!selectedCategory && (
          <h2 className="text-xl font-semibold text-gray-900">
            Select a Category
          </h2>
        )}

        <ToggleGroup
          type="single"
          value={selectedCategory || ''}
          onValueChange={handleCategorySelect}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories
            ?.filter(cat => !selectedCategory || cat.id === selectedCategory)
            .map(({ id, name }: { id: string; name: string }) => {
              const IconComponent = getCategoryIcon(name);
              return (
                <ToggleGroupItem
                  key={id}
                  value={id}
                  className="group relative h-full rounded-xl border-2 border-gray-200 bg-gradient-to-br from-yellow-50 via-white to-gray-50 shadow-sm transition-all hover:shadow-lg hover:from-yellow-100 hover:via-yellow-50 hover:to-white data-[state=on]:border-yellow-500 data-[state=on]:shadow-md data-[state=on]:from-yellow-100 data-[state=on]:via-yellow-50 data-[state=on]:to-white"
                >
                  <div className="flex h-full p-6">
                    <div className="flex-shrink-0">
                      <IconComponent className="w-12 h-12 text-gray-700 transition-colors group-hover:text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0 ml-3">
                      <p className="text-lg font-medium text-gray-900 transition-colors group-hover:text-yellow-600">
                        {name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 break-words group-hover:text-gray-700">
                        {getCategoryDescription(name)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4 self-center">
                      <ChevronRight className="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-yellow-500" />
                    </div>
                  </div>
                </ToggleGroupItem>
              );
            })}
        </ToggleGroup>

        {selectedCategoryData?.subcategories && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Select a Subcategory
              </h2>
              <p className="text-sm text-gray-500">
                {selectedCategoryData.subcategories.length} options available
              </p>
            </div>

            <ToggleGroup
              type="single"
              value={selectedSubcategory || ''}
              onValueChange={handleSubcategorySelect}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {selectedCategoryData.subcategories.map((subcategory: Subcategory) => (
                <ToggleGroupItem
                  key={subcategory.id}
                  value={subcategory.id}
                  className="group flex h-24 items-center justify-between p-6 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-yellow-50 via-white to-gray-50 shadow-sm transition-all hover:shadow-lg hover:from-yellow-100 hover:via-yellow-50 hover:to-white data-[state=on]:border-yellow-500 data-[state=on]:shadow-md data-[state=on]:from-yellow-100 data-[state=on]:via-yellow-50 data-[state=on]:to-white"
                >
                  <p className="text-sm font-medium text-gray-900 group-hover:text-yellow-600">
                    {subcategory.name}
                  </p>
                  <ChevronRight className="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-yellow-500" />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
      </div>
    </Card>
  );
}

const categoryData = {
  'Animal Care': {
    icon: PawPrint,
    description: 'Professional pet services including grooming, training, and veterinary care'
  },
  'Creative Services': {
    icon: Palette,
    description: 'Design, photography, and artistic services for your creative needs'
  },
  'Home and Garden': {
    icon: Home,
    description: 'Home improvement, landscaping, and maintenance services'
  },
  'Mechanics': {
    icon: Wrench,
    description: 'Professional automotive repair and maintenance services'
  },
  'Personal Services': {
    icon: Scissors,
    description: 'Beauty, wellness, and personal care services'
  },
  'Sports and Recreation': {
    icon: Trophy,
    description: 'Fitness training, sports coaching, and recreational activities'
  },
  'Technicians': {
    icon: Cpu,
    description: 'Technical support, repairs, and IT services'
  },
  'Transportation': {
    icon: Car,
    description: 'Transportation, delivery, and logistics services'
  }
};

const getCategoryIcon = (categoryName: string) => {
  const category = categoryData[categoryName as keyof typeof categoryData];
  return category?.icon || Layers;
};

const getCategoryDescription = (categoryName: string) => {
  const category = categoryData[categoryName as keyof typeof categoryData];
  return category?.description || 'Professional services to meet your needs';
};
