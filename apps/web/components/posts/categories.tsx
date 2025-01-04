"use client";

import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { getCategories } from "@/lib/categoriesUtils";
import { Button } from "@repo/ui/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

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
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  const handleCategorySelect = (value: string) => {
    const newValue = value === selectedCategory ? null : value;
    setSelectedCategory(newValue);
  };

  const handleSubcategorySelect = (value: string) => {
    const newValue = value === selectedSubcategory ? null : value;
    setSubcategory(newValue);
    updateFormData({ tags: { subcategoryId: newValue! } });
  };

  if (isLoading) return <p>Loading categories...</p>;

  const selectedCategoryData = categories?.find(
    (category: Category) => category.id === selectedCategory
  );

  return (
    <div className="p-4">
      {selectedCategory && (
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedCategory(null);
            setSubcategory(null);
            updateFormData({ tags: { subcategoryId: "" } });
          }}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Show all categories
        </Button>
      )}

      <ToggleGroup
        type="single"
        value={selectedCategory || ''}
        onValueChange={handleCategorySelect}
        className="grid gap-4 md:grid-cols-2"
      >
        {categories?.filter(cat => !selectedCategory || cat.id === selectedCategory)
          .map(({ id, name }: { id: string; name: string }) => (
            <ToggleGroupItem
              key={id}
              value={id}
              className="flex items-center justify-center py-6 rounded-lg border-2 border-gray-300 transition-all hover:border-yellow-500 data-[state=on]:border-yellow-500 data-[state=on]:bg-yellow-100"
            >
              <p className="text-sm font-medium">{name}</p>
            </ToggleGroupItem>
          ))}
      </ToggleGroup>

      {selectedCategoryData?.subcategories && (
        <ToggleGroup
          type="single"
          value={selectedSubcategory || ''}
          onValueChange={handleSubcategorySelect}
          className="grid gap-4 md:grid-cols-2"
        >
          {selectedCategoryData.subcategories.map((subcategory: Subcategory) => (
            <ToggleGroupItem
              key={subcategory.id}
              value={subcategory.id}
              className="flex items-center justify-center py-6 rounded-lg border-2 border-gray-300 transition-all hover:border-yellow-500 data-[state=on]:border-yellow-500 data-[state=on]:bg-yellow-100"
            >
              <p className="text-sm font-medium">{subcategory.name}</p>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </div>
  );
}
