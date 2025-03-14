"use client";

import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";
import { ReactNode } from "react";
import { motion } from "framer-motion";
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
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className={cn("w-full", className)}
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
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
          <motion.div
            key={value}
            variants={itemVariants}
          >
            <ToggleGroupItem
              value={value}
              className={cn(
                "group relative w-full h-full rounded-2xl border-2 p-6",
                "hover:border-yellow-500 hover:shadow-xl",
                "data-[state=on]:border-yellow-500 data-[state=on]:bg-yellow-50/50",
                itemClassName
              )}
            >
              <div className="flex items-center space-x-4 sm:space-x-6 p-4 sm:p-6">
                {icon && (
                  <motion.div
                    className="flex-shrink-0"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {icon}
                  </motion.div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-gray-900">
                    {label}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 group-hover:text-gray-600">
                    {description}
                  </p>
                </div>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-yellow-500" />
                </motion.div>
              </div>
            </ToggleGroupItem>
          </motion.div>
        ))}
      </ToggleGroup>
    </motion.div>
  );
}
