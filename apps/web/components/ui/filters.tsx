"use client";

import { DualRangeSlider } from '@repo/ui/components/ui/dual-range-slider';
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { SlidersHorizontal, X } from "lucide-react";
import LocationNavigation, { Location } from "./locationNavigation";
import { engagementTypes } from "../posts/service-engagement";
import { SelectTargetAudience } from "../posts/service-description";
import { specialOffers, ToggleGrid } from "../posts/service-offer";
import { EngagementType, PricingType, ServicesIncluded, TargetAudience } from "@prisma/client/edge";
import { PricingSelectionType } from "../posts/pricing-setup";
import { ToggleGroupSelection } from "@repo/ui/components/ui/toggle-group-selection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import { AnimatePresence, motion, PanInfo, useAnimation } from 'framer-motion'
import { Button } from "@repo/ui/components/ui/button";
import { useMediaQuery } from "@/hooks/useMedia";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/components/ui/dialog';

export interface FiltersProps {
  initialState: {
    location: Location | null;
    priceMin: number | null;
    priceMax: number | null;
    pricingType: PricingType;
    engagementType: EngagementType;
    targetAudience: TargetAudience;
    servicesIncluded: ServicesIncluded[];
  };
  onFilterChange: (filters: Partial<FiltersProps['initialState']>) => void;
  className?: string;
}

export const FilterDialogWrapper = ({ initialState, onFilterChange, className }: FiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  const handleFilterChange = (filters: any) => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  return (
    <>
      {isLargeScreen ? (
        // Dialog for large screens
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              className="whitespace-nowrap w-12 h-12 md:w-28 md:h-12 border-0 md:border text-xs md:border-gray-300 bg-gray-100 md:bg-white md:hover:border-gray-900 
        dark:md:border-slate-700 rounded-xl shadow-sm md:hover:bg-yellow-400 dark:hover:bg-slate-800
        p-2 md:p-6 group transition-transform active:scale-95"
            >
              <SlidersHorizontal className="md:mr-2 h-4 w-4" />
              <span className="hidden md:inline">Filters</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl !rounded-3xl p-0 flex flex-col max-h-[90vh] overflow-auto gap-0">
            <DialogHeader className="sticky top-0 z-10 bg-white p-4 border-b border-gray-300">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="absolute left-2 p-2 rounded-full active:scale-95"
              >
                <X className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-lg font-semibold text-gray-800 text-center">
                Filters
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <ModifiedFilters
                initialState={initialState}
                onFilterChange={handleFilterChange}
                className={className}
                onClose={() => setIsOpen(false)}
                isDialog={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        // Drawer for mobile/smaller screens
        <>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsOpen(!isOpen)}
            className="whitespace-nowrap w-12 h-12 md:w-28 md:h-12 border-0 md:border text-xs md:border-gray-300 bg-gray-100 md:bg-white md:hover:border-gray-900 
              dark:md:border-slate-700 rounded-xl shadow-sm md:hover:bg-yellow-400 dark:hover:bg-slate-800
              p-2 md:p-6 group transition-transform active:scale-95"
          >
            <SlidersHorizontal className="md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Filters</span>
          </Button>
          <AnimatePresence>
            {isOpen && (
              <ModifiedFilters
                initialState={initialState}
                onFilterChange={onFilterChange}
                className={className}
                onClose={() => setIsOpen(false)}
                isDialog={false}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
};

export function Separator({ className }: { className?: string }) {
  return <div className={`w-full h-px bg-gray-200 ${className}`} />;
}

export const ModifiedFilters = React.memo(({
  initialState,
  onFilterChange,
  className,
  onClose,
  isDialog = false
}: FiltersProps & {
  onClose: () => void;
  isDialog?: boolean;
}) => {
  // All your existing state and handlers remain the same
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const [values, setValues] = useState([
    initialState.priceMin ?? 5,
    initialState.priceMax ?? 250
  ]);
  const [minMax, setMinMax] = useState([5, 250]);
  const [selectedPricingType, setSelectedPricingType] = useState<PricingType | null>(
    initialState.pricingType
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialState.location
  );
  const [selectedType, setSelectedType] = useState<EngagementType | null>(
    initialState.engagementType
  );
  const [selectedTargetAudience, setSelectedTargetAudience] = useState<TargetAudience | null>(
    initialState.targetAudience
  );
  const [selectedSpecialOffers, setSelectedSpecialOffers] = useState<ServicesIncluded[]>(
    initialState.servicesIncluded
  );

  // Only use these if it's a drawer (mobile)
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const minHeight = 100;
  const mediumHeight = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 500;
  const maxHeight = '100vh';

  const springTransition = {
    type: "spring",
    damping: 30,
    stiffness: 300,
    mass: 0.8
  };

  const drawerVariants = {
    hidden: {
      y: "100%",
      height: minHeight,
      transition: springTransition
    },
    visible: {
      y: 0,
      height: maxHeight,
      transition: springTransition
    },
    exit: {
      y: "100%",
      transition: { ...springTransition, duration: 0.3 }
    }
  };


  const handleClearFilters = () => {
    setSelectedLocation(null);
    setValues([5, 250]);
    setMinMax([5, 250]);
    setSelectedPricingType(null);
    setSelectedType(null);
    setSelectedTargetAudience(null);
    setSelectedSpecialOffers([]);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isDialog || isMapInteracting) {
      return;
    }

    const velocity = info.velocity.y;
    const currentOffset = info.offset.y;

    if (velocity > 500 || currentOffset > 200) {
      onClose();
    } else if (velocity < -500 || currentOffset < -200) {
      controls.start({ height: maxHeight });
    } else {
      const currentHeight = containerRef.current?.getBoundingClientRect().height || 0;
      if (currentHeight < mediumHeight) {
        controls.start({ height: minHeight });
      } else {
        controls.start({ height: maxHeight });
      }
    }
  };

  const handleApplyFilters = () => {
    onFilterChange({
      location: selectedLocation,
      priceMin: values[0],
      priceMax: values[1],
      pricingType: selectedPricingType!,
      engagementType: selectedType!,
      targetAudience: selectedTargetAudience!,
      servicesIncluded: selectedSpecialOffers
    });
    onClose();
  };

  const handlePricingTypeChange = (type: PricingType) => {
    if (selectedPricingType === type) {
      setSelectedPricingType(null);
      setMinMax([5, 250]);
      setValues([5, 250]);
      return;
    }

    setSelectedPricingType(type);
    switch (type) {
      case PricingType.HOURLY:
        setMinMax([5, 250]);
        setValues([5, 250]);
        break;
      case PricingType.FIXED_PRICE:
        setMinMax([100, 10000]);
        setValues([100, 10000]);
        break;
      default:
        setMinMax([5, 250]);
        setValues([5, 250]);
    }
  };

  const [pendingLocation, setPendingLocation] = useState<Location | null>(null);
  const handleLocationSelect = (value: Location | null) => {
    const newValue = value?.lat === selectedLocation?.lat
      && value?.lng === selectedLocation?.lng
      ? null : value;
    setSelectedLocation({
      lat: value?.lat || 0,
      lng: value?.lng || 0,
      address: value?.address || '',
    });

    if (newValue) {
      if (selectedType) {
      } else {
        setPendingLocation(newValue);
      }
    }
  };

  const handleTargetAudienceChange = (value: TargetAudience) => {
    const newValue = value === selectedTargetAudience ? null : value;
    setSelectedTargetAudience(newValue);
  };

  const handleTypeSelect = (value: EngagementType) => {
    const newValue = value === selectedType ? null : value;
    setSelectedType(newValue);
  };

  const handleValueChange = (value: ServicesIncluded[]) => {
    setSelectedSpecialOffers(value);
  };

  useEffect(() => {
    if (!isDialog) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [onClose, isDialog]);

  if (isDialog) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Location</h3>
            <p className="text-sm text-gray-500">
              Select a location to find freelancers near you or within your preferred area.
            </p>
            <LocationNavigation
              selectedLocation={selectedLocation}
              setSelectedLocation={handleLocationSelect}
              maptilerKey={process.env.MAPTILER_API_KEY}
              setIsMapInteracting={setIsMapInteracting}
            />
          </div>

          <div className="py-3">
            <Separator />
          </div>

          <div className="space-y-6 pb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Pricing Type</h3>
              <p className="text-sm text-gray-500">
                {`Choose how you'd like to see pricing: by hourly rates or total project budget.`}
              </p>
              <PricingSelectionType
                selectedPricingType={selectedPricingType}
                setSelectedPricingType={handlePricingTypeChange}
              />
            </div>

            {selectedPricingType && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    {selectedPricingType === PricingType.HOURLY
                      ? "Hourly rate range"
                      : "Project budget range"}
                  </p>
                </div>
                <div className="px-4">
                  <DualRangeSlider
                    value={[values[0], values[1]]}
                    onValueChange={setValues}
                    min={minMax[0]}
                    max={minMax[1]}
                    formatLabel={(value) => `$${value}`}
                    showTooltip={true}
                    className="[&_.slider-thumb]:bg-yellow-500 [&_.slider-track]:bg-yellow-500"
                  />
                </div>
              </div>
            )}
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:no-underline py-8 border-t">
                Engagement Type
              </AccordionTrigger>
              <AccordionContent className="overflow-visible px-1 pt-4 pb-12">
                <div className="p-1">
                  <ToggleGroupSelection
                    options={engagementTypes}
                    selectedValue={selectedType}
                    onSelect={handleTypeSelect}
                    toggleGroupClassName="grid-cols-1 md:grid-cols-2 gap-4"
                    itemClassName="hover:scale-[1.02] transition-transform duration-200"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:no-underline py-8">
                Target Audience
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-12">
                <SelectTargetAudience
                  selectedTargetAudience={selectedTargetAudience}
                  setSelectedTargetAudience={handleTargetAudienceChange}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-none">
              <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:no-underline py-8">
                Services Included
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-12">
                <div className="p-1">
                  <ToggleGrid
                    options={specialOffers}
                    selectedValues={selectedSpecialOffers}
                    onValueChange={handleValueChange}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Fixed footer with Apply Filters button */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-6 z-10">
          <div className="flex gap-4 justify-between items-center">
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="w-auto rounded-xl py-6 border-none text-gray-700 hover:bg-gray-100 font-semibold active:scale-[0.98]"
            >
              Clear all
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="rounded-xl py-7 px-8 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-sm transition-colors active:scale-[0.98]"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Drawer mode - your existing drawer implementation
  return (
    <motion.div
      ref={containerRef}
      variants={drawerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      drag={!isMapInteracting ? "y" : false}
      dragConstraints={{ top: 0, bottom: typeof window !== 'undefined' ? window.innerHeight - minHeight : 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="fixed border-t-2 border-gray-300 bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
    >
      {/* Drawer Handle */}
      <div
        className="pt-4 pb-2 cursor-pointer"
        onClick={onClose}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto transition-colors hover:bg-gray-400" />
      </div>

      {/* Content */}
      <motion.div
        className="overflow-y-auto h-full pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Card className="border-none shadow-none">
          <CardHeader className="border-b-2 border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800 text-center">
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-6 py-6 lg:py-10 px-6 lg:px-36 ${className}`}>
            {/* All your existing filter content here */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Location</h3>
              <p className="text-sm text-gray-500">
                Select a location to find freelancers near you or within your preferred area.
              </p>
              <LocationNavigation
                selectedLocation={selectedLocation}
                setSelectedLocation={handleLocationSelect}
                maptilerKey={process.env.MAPTILER_API_KEY}
                setIsMapInteracting={setIsMapInteracting}
              />
            </div>

            <div className="py-3">
              <Separator />
            </div>

            {/* Price Range Section */}
            <div className="space-y-6 pb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Pricing Type</h3>
                <p className="text-sm text-gray-500">
                  {`Choose how you'd like to see pricing: by hourly rates or total project budget.`}
                </p>
                <PricingSelectionType
                  selectedPricingType={selectedPricingType}
                  setSelectedPricingType={handlePricingTypeChange}
                />
              </div>

              {selectedPricingType && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">
                      {selectedPricingType === PricingType.HOURLY
                        ? "Hourly rate range"
                        : "Project budget range"}
                    </p>
                  </div>
                  <div className="px-4">
                    <DualRangeSlider
                      value={[values[0], values[1]]}
                      onValueChange={setValues}
                      min={minMax[0]}
                      max={minMax[1]}
                      formatLabel={(value) => `$${value}`}
                      showTooltip={true}
                      className="[&_.slider-thumb]:bg-yellow-500 [&_.slider-track]:bg-yellow-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:no-underline py-8 border-t">
                  Engagement Type
                </AccordionTrigger>
                <AccordionContent className="overflow-visible px-1 pt-4 pb-12">
                  <div className="p-1">
                    <ToggleGroupSelection
                      options={engagementTypes}
                      selectedValue={selectedType}
                      onSelect={handleTypeSelect}
                      toggleGroupClassName="grid-cols-1 md:grid-cols-2 gap-4"
                      itemClassName="hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:no-underline py-8">
                  Target Audience
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-12">
                  <SelectTargetAudience
                    selectedTargetAudience={selectedTargetAudience}
                    setSelectedTargetAudience={handleTargetAudienceChange}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-none">
                <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:no-underline py-8">
                  Services Included
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-12">
                  <div className="p-1">
                    <ToggleGrid
                      options={specialOffers}
                      selectedValues={selectedSpecialOffers}
                      onValueChange={handleValueChange}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Apply Filters Button */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 px-8 py-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <div className="flex gap-4 justify-between items-center">
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="w-auto rounded-xl py-6 border-none text-gray-700 hover:bg-gray-100 font-semibold active:scale-[0.98]"
          >
            Clear all
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="rounded-xl py-7 px-8 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-sm transition-colors active:scale-[0.98]"
          >
            Apply Filters
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
});

ModifiedFilters.displayName = "ModifiedFilters";
