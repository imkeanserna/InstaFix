"use client";

import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { ServicesIncluded } from "@prisma/client";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";
import { Zap, RefreshCcw, Phone, ClipboardList, Clock, Wallet, Image, Shield } from 'lucide-react';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ServiceOffer() {
  const [selectedSpecialOffers, setSelectedSpecialOffers] = useState<ServicesIncluded[]>([]);
  const specialOffers = [
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

  // For animation and it uses framer-motion
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
      className="max-w-4xl mx-auto pt-8 sm:pt-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <ToggleGroup
        type="multiple"
        value={selectedSpecialOffers}
        onValueChange={handleValueChange}
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 p-2 sm:p-0"
      >
        {specialOffers.map(({ value, label, description, icon: Icon, color, bgColor }) => (
          <motion.div
            key={value}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ToggleGroupItem
              value={value}
              className="group relative p-4 h-full w-full rounded-xl border-2 data-[state=on]:shadow-lg transition-all duration-200
                hover:border-gray-300 data-[state=on]:border-yellow-500"
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  className={`p-2 rounded-lg ${bgColor} ${color} transition-colors duration-200
                    group-hover:scale-110 group-data-[state=on]:scale-110`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <motion.div
                  className="flex-1 text-left"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-semibold text-gray-900">{label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                </motion.div>
                <motion.div
                  className={`w-3 h-3 rounded-full border-2 transition-all
                    group-data-[state=on]:bg-yellow-500 group-data-[state=on]:border-yellow-500
                    group-hover:border-yellow-500`}
                  whileHover={{ scale: 1.2 }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                />
              </div>
              {/* Animated gradient overlay */}
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
      <motion.div
        className="mt-6 text-center text-sm text-gray-500"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {selectedSpecialOffers.length === 0 ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Select at least one special feature to continue
          </motion.span>
        ) : (
          <motion.span
            className="text-green-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {selectedSpecialOffers.length} feature{selectedSpecialOffers.length !== 1 && 's'} selected
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}
