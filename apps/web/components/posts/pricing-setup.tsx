"use client";

import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { PricingType } from "@prisma/client/edge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import React, { useEffect, useState } from "react";
import { NumericInput } from "@repo/ui/components/ui/numeric-input";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { ChevronLeft, Clock, DollarSign, Info, Package, Stars, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

type Currency = 'USD' | 'PHP';

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  PHP: '₱'
};

export function PrincingComponentPage() {
  return (
    <div className="h-full bg-gradient-to-b from-white to-yellow-50 py-24 md:py-20">
      <div className="max-w-3xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-start space-y-2"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Now, set your price
          </h1>
          <p className="text-gray-600 text-sm">
            {`Don't worry, you can adjust this later to match your goals and clients' needs.`}
          </p>
        </motion.div>
        <PricingSetup />
      </div>
    </div>
  );
}

export function PricingSetup() {
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('price');
  const [selectedPricingType, setSelectedPricingType] = useState<PricingType | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');

  useEffect(() => {
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  const handlePricingTypeSelect = (value: PricingType) => {
    const newValue = value === selectedPricingType ? null : value;
    setSelectedPricingType(newValue);

    if (price !== null && newValue !== null) {
      updateFormData({
        pricing: {
          pricingType: newValue,
          hourlyRate: selectedPricingType === PricingType.HOURLY ? Number(price) : 0,
          fixedPrice: selectedPricingType === PricingType.FIXED_PRICE ? Number(price) : 0
        }
      });
    }
  }

  const handlePriceChange = (value: string) => {
    setPrice(value);
    if (selectedPricingType !== null && value !== null) {
      updateFormData({
        pricing: {
          pricingType: selectedPricingType,
          hourlyRate: selectedPricingType === PricingType.HOURLY ? Number(value) : 0,
          fixedPrice: selectedPricingType === PricingType.FIXED_PRICE ? Number(value) : 0
        }
      });
    }
  }

  return (
    <TooltipProvider>
      <div className="max-w-4xl p-4 md:p-8 mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <PricingSelectionType
            selectedPricingType={selectedPricingType}
            setSelectedPricingType={handlePricingTypeSelect}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedPricingType && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                scale: {
                  type: "spring",
                  damping: 12,
                  stiffness: 100
                }
              }}
            >
              <Card>
                <CardContent className="p-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <motion.h3
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-xl font-semibold text-gray-900"
                        >
                          {selectedPricingType === PricingType.HOURLY ? "Set Your Hourly Rate" : "Set Your Fixed Price"}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="text-sm text-gray-500"
                        >
                          Consider your experience, skills, and market demand
                        </motion.p>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Select
                          value={currency}
                          onValueChange={(value: Currency) => setCurrency(value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue>
                              <span className="font-semibold">{currencySymbols[currency]}</span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">
                              <span className="font-semibold">$ USD</span>
                            </SelectItem>
                            <SelectItem value="PHP">
                              <span className="font-semibold">₱ PHP</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                      className={cn(
                        "relative group rounded-2xl bg-gray-50 p-4 md:p-8 transition-all duration-300",
                      )}
                    >
                      <div className="flex items-center justify-center gap-0 md:gap-4">
                        <span className={cn(
                          "text-[60px] md:text-8xl font-bold transition-all duration-300",
                          "text-gray-400"
                        )}>
                          {currencySymbols[currency]}
                        </span>
                        <div className="relative">
                          <NumericInput
                            value={price}
                            onChange={handlePriceChange}
                            placeholder="0"
                            minValue={0}
                            maxValue={999999}
                            className={cn(
                              "text-[60px] md:text-8xl font-bold bg-transparent border-none focus:outline-none",
                              "placeholder:text-gray-300 w-full"
                            )}
                          />
                          {selectedPricingType === PricingType.HOURLY && (
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 ml-2 text-2xl text-gray-500">/hr</span>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="grid gap-4"
                    >
                      <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="font-medium text-gray-900">Consider These Factors</h4>
                          <ul className="text-sm text-gray-600 space-y-2">
                            <li>• Your experience level and specialized skills</li>
                            <li>• Current market rates in your location</li>
                            <li>• Project complexity and scope</li>
                            <li>• Your unique value proposition</li>
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-600">Research market rates</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Look up rates for similar services in your area</p>
                            </TooltipContent>
                          </Tooltip>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-600">Set competitive rates</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Price based on your unique value and expertise</p>
                            </TooltipContent>
                          </Tooltip>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

interface PricingSelectionTypeProps {
  selectedPricingType: PricingType | null;
  setSelectedPricingType: (value: PricingType) => void;
}

export function PricingSelectionType({ selectedPricingType, setSelectedPricingType }: PricingSelectionTypeProps) {
  const engagementTypes = [
    {
      value: PricingType.HOURLY,
      label: "Hourly Rate",
      description: "Perfect for projects with varying scope and ongoing work",
      icon: <Clock className="w-6 h-6" />,
      benefits: ["Flexible billing", "Great for time-tracking", "Ideal for consultations"],
      available: true
    },
    {
      value: PricingType.FIXED_PRICE,
      label: "Fixed Price",
      description: "Best for well-defined projects with clear deliverables",
      icon: <DollarSign className="w-6 h-6" />,
      benefits: ["Clear project scope", "Upfront pricing", "No surprises"],
      available: true
    },
    {
      value: PricingType.CUSTOM,
      label: "Custom Pricing",
      description: "Tailored pricing based on specific project requirements",
      icon: <Stars className="w-6 h-6" />,
      benefits: ["Personalized quotes", "Flexible terms", "Complex projects"],
      available: false
    },
    {
      value: PricingType.PACKAGE,
      label: "Package Pricing",
      description: "Pre-defined service bundles at different price points",
      icon: <Package className="w-6 h-6" />,
      benefits: ["Multiple tiers", "Bundled services", "Value pricing"],
      available: false
    }
  ];

  const handlePricingTypeChange = (value: PricingType) => {
    const selectedType = engagementTypes.find(type => type.value === value);
    if (selectedType?.available) {
      setSelectedPricingType(value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      {selectedPricingType && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-end mb-4 text-xs text-gray-500"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Click the card to change your selection
        </motion.div>
      )}
      <motion.div
        layout
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6",
          selectedPricingType ? "md:grid-cols-1 max-w-2xl mx-auto" : "md:grid-cols-2"
        )}
        transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
      >
        {engagementTypes.map(({ value, label, description, icon, benefits, available }) => (
          <motion.div
            key={value}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: !selectedPricingType || selectedPricingType === value ? 1 : 0,
              y: 0,
              scale: selectedPricingType === value ? 1.02 : 1,
              display: !selectedPricingType || selectedPricingType === value ? 'block' : 'none'
            }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                "hover:shadow-lg",
                available ? "cursor-pointer" : "cursor-not-allowed",
                selectedPricingType === value ? "ring-2 ring-yellow-500 shadow-lg" : "hover:border-yellow-200",
                !available && "opacity-75"
              )}
              onClick={() => available && handlePricingTypeChange(value)}
            >
              <CardContent className="p-6">
                <motion.div
                  className="flex items-start space-x-4"
                  layout
                >
                  <motion.div
                    layout
                    className={cn(
                      "p-3 rounded-full",
                      available ? "bg-yellow-100" : "bg-gray-100"
                    )}
                    whileHover={{ scale: 1.05 }}
                  >
                    {React.cloneElement(icon, {
                      className: cn(
                        "w-6 h-6",
                        available ? "text-yellow-600" : "text-gray-400"
                      )
                    })}
                  </motion.div>

                  <motion.div layout className="flex-1">
                    <motion.div layout className="flex justify-between items-center">
                      <motion.h3
                        layout
                        className={cn(
                          "text-lg font-semibold",
                          available ? "text-gray-900" : "text-gray-500"
                        )}
                      >
                        {label}
                      </motion.h3>
                      {!available && (
                        <motion.span
                          layout
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800"
                        >
                          Coming Soon
                        </motion.span>
                      )}
                    </motion.div>

                    <motion.p
                      layout
                      className="mt-2 text-sm text-gray-600"
                    >
                      {description}
                    </motion.p>

                    {available && (
                      <motion.ul
                        layout
                        className="mt-4 space-y-2"
                      >
                        {benefits.map((benefit, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <motion.div
                              layout
                              className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2"
                            />
                            {benefit}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

