"use client";

import { getCategories } from "@/lib/categoriesUtils";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";
import { useQuery } from '@tanstack/react-query';

export default function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  if (isLoading) return <p>Loading categories...</p>;

  return (
    <div className="p-4">
      <ToggleGroup
        type="single"
        onValueChange={(value) => console.log(value)}
        className="grid gap-4 md:grid-cols-2"
      >
        {categories?.map(({ id, name }: { id: string; name: string }) => (
          <ToggleGroupItem
            key={id}
            value={id}
            className="flex items-center justify-center py-6 rounded-lg border-2 border-gray-300 transition-all hover:border-yellow-500 data-[state=on]:border-yellow-500 data-[state=on]:bg-yellow-100"
          >
            <p className="text-sm font-medium">{name}</p>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
