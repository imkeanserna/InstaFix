"use client";

import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";
import { ReactNode } from "react";

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
}

export function ToggleGroupSelection({
  options,
  selectedValue,
  onSelect
}: ReusableToggleGroupProps) {
  return (
    <ToggleGroup
      type="single"
      value={selectedValue || ''}
      onValueChange={onSelect}
      className="flex flex-col gap-2"
    >
      {options.map(({ value, label, description, icon }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          className="w-full py-6 px-4 rounded-lg border-2 border-gray-300 transition-all hover:border-yellow-500 data-[state=on]:border-yellow-500 data-[state=on]:bg-yellow-100"
        >
          <div className={`flex justify-between w-full ${icon ? 'gap-4' : ''}`}>
            <div className="text-start">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
            {icon && <div className="flex-shrink-0">{icon}</div>}
          </div>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

