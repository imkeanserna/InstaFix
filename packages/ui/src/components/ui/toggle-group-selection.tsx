"use client";

import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";
import { ReactNode } from "react";

import { cn } from "@repo/ui/lib/utils"
import { ChevronRight } from "lucide-react";

interface ToggleOption {
  value: string;
  label: string;
  description: string;
  icon?: ReactNode;
}

interface ReusableToggleGroupProps {
  options: ToggleOption[];
  selectedValue: string | null;
  onSelect: (value: any) => void;
  className?: string;
  toggleGroupClassName?: string;
  itemClassName?: string;
}

export function ToggleGroupSelection({
  options,
  selectedValue,
  onSelect,
  className,
  toggleGroupClassName,
  itemClassName
}: ReusableToggleGroupProps) {
  return (
    <div className={cn("w-full", className)}>
      <ToggleGroup
        type="single"
        value={selectedValue || ''}
        onValueChange={onSelect}
        className={cn(
          "grid gap-3",
          toggleGroupClassName
        )}
      >
        {options.map(({ value, label, description, icon }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            className={cn(
              "group relative h-full w-full rounded-xl border-2 border-gray-200 p-0 transition-all hover:border-yellow-500 hover:shadow-md data-[state=on]:border-yellow-500 data-[state=on]:bg-yellow-50/50",
              itemClassName
            )}
          >
            <div className="flex items-center p-6">
              {icon && (
                <div className="flex-shrink-0 mr-4">
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-900 group-hover:text-gray-900">
                  {label}
                </p>
                <p className="mt-1 text-sm text-gray-500 group-hover:text-gray-600">
                  {description}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 ml-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-yellow-500" />
            </div>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
