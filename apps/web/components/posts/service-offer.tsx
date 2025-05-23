"use client";

import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { ServicesIncluded } from "@prisma/client";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";
import { Zap, RefreshCcw, Phone, ClipboardList, Clock, Wallet, Image, Shield, LucideIcon } from 'lucide-react';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const specialOffers = [
  {
    value: ServicesIncluded.FAST_TURNAROUND,
    label: "Fast Turnaround",
    description: "Quick delivery of your project",
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-50"
  },
  {
    value: ServicesIncluded.UNLIMITED_REVISIONS,
    label: "Unlimited Revisions",
    description: "Revise until you're satisfied",
    icon: RefreshCcw,
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    value: ServicesIncluded.FREE_CONSULTATION,
    label: "Free Consultation",
    description: "Initial discussion at no cost",
    icon: Phone,
    color: "text-green-500",
    bgColor: "bg-green-50"
  },
  {
    value: ServicesIncluded.PROJECT_MANAGEMENT_SUPPORT,
    label: "Project Management",
    description: "Full project coordination",
    icon: ClipboardList,
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  {
    value: ServicesIncluded.AVAILABILITY_24_7,
    label: "24/7 Availability",
    description: "Round-the-clock support",
    icon: Clock,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50"
  },
  {
    value: ServicesIncluded.NO_UPFRONT_PAYMENT,
    label: "No Upfront Payment",
    description: "Pay when satisfied",
    icon: Wallet,
    color: "text-rose-500",
    bgColor: "bg-rose-50"
  },
  {
    value: ServicesIncluded.PROFESSIONAL_PORTFOLIO,
    label: "Professional Portfolio",
    description: "View past work samples",
    icon: Image,
    color: "text-teal-500",
    bgColor: "bg-teal-50"
  },
  {
    value: ServicesIncluded.MONEY_BACK_GUARANTEE,
    label: "Money Back Guarantee",
    description: "100% satisfaction guaranteed",
    icon: Shield,
    color: "text-orange-500",
    bgColor: "bg-orange-50"
  }
];

export default function ServiceOffer() {
  const [selectedSpecialOffers, setSelectedSpecialOffers] = useState<ServicesIncluded[]>([]);
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('special-features');

  useEffect(() => {
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  const handleValueChange = (value: ServicesIncluded[]) => {
    setSelectedSpecialOffers(value);
    updateFormData({
      basicInfo: {
        servicesIncluded: value
      }
    });
  }

  return (
    <ToggleGrid
      options={specialOffers}
      selectedValues={selectedSpecialOffers}
      onValueChange={handleValueChange}
      className="pt-8 sm:pt-12"
    />
  )
}

interface ToggleOption {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

interface ToggleGridProps {
  options: ToggleOption[];
  selectedValues: string[];
  onValueChange: (value: ServicesIncluded[]) => void;
  className?: string;
  showCount?: boolean;
}

export function ToggleGrid({
  options,
  selectedValues,
  onValueChange,
  className = "",
  showCount = true
}: ToggleGridProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
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
      className={`w-full ${className}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <ToggleGroup
        type="multiple"
        value={selectedValues}
        onValueChange={onValueChange}
        className="w-full p-2 sm:p-0"
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gridAutoRows: '1fr'
        }}
      >
        {options.map(({ value, label, description, icon: Icon, color, bgColor }) => (
          <motion.div
            key={value}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
          >
            <ToggleGroupItem
              value={value}
              className="group relative p-4 h-full w-full rounded-xl border-2 data-[state=on]:shadow-lg transition-all duration-200
                hover:border-gray-300 data-[state=on]:border-yellow-500 flex flex-col"
            >
              <div className="flex items-start space-x-4 h-full">
                <motion.div
                  className={`p-2 rounded-lg ${bgColor} ${color} transition-colors duration-200
                    group-hover:scale-110 group-data-[state=on]:scale-110 flex-shrink-0`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <motion.div
                  className="flex-1 min-w-0 text-left"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-semibold text-gray-900 truncate">{label}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
                </motion.div>
                <motion.div
                  className={`flex-shrink-0 w-3 h-3 rounded-full border-2 transition-all
                    group-data-[state=on]:bg-yellow-500 group-data-[state=on]:border-yellow-500
                    group-hover:border-yellow-500`}
                  whileHover={{ scale: 1.2 }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                />
              </div>
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-br from-gray-50 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </ToggleGroupItem>
          </motion.div>
        ))}
      </ToggleGroup>
      {showCount && (
        <motion.div
          className="mt-6 text-center text-sm text-gray-500"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {selectedValues.length === 0 ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Select at least one option to continue
            </motion.span>
          ) : (
            <motion.span
              className="text-green-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {selectedValues.length} option{selectedValues.length !== 1 && 's'} selected
            </motion.span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
